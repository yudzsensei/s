import { MongoClient } from 'mongodb';

type Request = { method?: string; query: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { status: (code: number) => Response; json: (body: unknown) => void };
type LinkDocument = { slug: string; target_url: string; clicks: number; created_at: Date };
type RuntimeProcess = { env: Record<string, string | undefined> };

const runtimeProcess = (globalThis as typeof globalThis & { process?: RuntimeProcess }).process;
let clientPromise: Promise<MongoClient> | null = null;

const getClient = () => {
  const uri = runtimeProcess?.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  clientPromise ??= new MongoClient(uri).connect();
  return clientPromise;
};

const isValidTarget = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const jsonBody = (body: unknown): body is { slug: string; target_url: string } => {
  if (!body || typeof body !== 'object') return false;
  const candidate = body as Record<string, unknown>;
  return typeof candidate.slug === 'string' && isValidTarget(candidate.target_url);
};

export default async function handler(req: Request, res: Response) {
  try {
    const client = await getClient();
    const database = client.db(runtimeProcess?.env.MONGODB_DB_NAME || 'shortener');
    const links = database.collection<LinkDocument>('links');

    if (req.method === 'POST') {
      if (!jsonBody(req.body)) return res.status(400).json({ error: 'Invalid link data' });
      const slug = req.body.slug.trim();
      if (!/^[a-zA-Z0-9-_]{1,48}$/.test(slug)) return res.status(400).json({ error: 'Invalid alias' });

      try {
        const document: LinkDocument = { slug, target_url: new URL(req.body.target_url).toString(), clicks: 0, created_at: new Date() };
        await links.insertOne(document);
        return res.status(201).json({ slug: document.slug, target_url: document.target_url, clicks: document.clicks });
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) return res.status(409).json({ error: 'Alias already exists' });
        throw error;
      }
    }

    const slugParam = req.query.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (!slug || !/^[a-zA-Z0-9-_]{1,48}$/.test(slug)) return res.status(400).json({ error: 'Invalid slug' });
    const link = await links.findOne({ slug }, { projection: { _id: 0, slug: 1, target_url: 1, clicks: 1 } });
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (req.method === 'PATCH') {
      await links.updateOne({ slug }, { $inc: { clicks: 1 } });
    }
    return res.status(200).json(link);
  } catch (error) {
    console.error('links api failed', error);
    return res.status(500).json({ error: 'The link service is unavailable' });
  }
}

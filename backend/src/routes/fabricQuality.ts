import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({
  item_description: z.string().min(1),
  weight: z.number(),
  destination_sector: z.string(),
  observations: z.string().optional(),
  defect_image_url: z.string().optional(),
  employee_name: z.string(),
  inspection_date: z.string(),
});

router.get('/inspections', async (_req, res: Response) => {
  const records = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  res.json(records);
});

router.get('/inspections/:id', async (req, res: Response) => {
  const record = await prisma.fabricQualityInspection.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!record) { res.status(404).json({ error: 'Inspeção não encontrada' }); return; }
  res.json(record);
});

router.post('/inspections', async (req, res: Response): Promise<void> => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' }, select: { inspectionNumber: true } });
  const num = last ? parseInt(last.inspectionNumber.split('-')[1]) + 1 : 1;
  const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;

  const record = await prisma.fabricQualityInspection.create({
    data: { inspectionNumber, itemDescription: d.item_description, weight: d.weight, destinationSector: d.destination_sector, observations: d.observations, defectImageUrl: d.defect_image_url, employeeName: d.employee_name, inspectionDate: d.inspection_date },
  });
  res.status(201).json({ success: true, id: record.id, inspection_number: record.inspectionNumber });
});

export default router;

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  item_description: z.string().min(1),
  weight: z.number().positive(),
  destination_sector: z.string().min(1),
  observations: z.string().optional(),
  defect_image_url: z.string().optional(),
  employee_name: z.string().min(1),
  inspection_date: z.string(),
});

router.get('/inspections', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const inspections = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  res.json(inspections);
});

router.post('/inspections', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
  const inspectionNumber = last
    ? `INS-${String(parseInt(last.inspectionNumber.split('-')[1]) + 1).padStart(3, '0')}`
    : 'INS-001';

  const inspection = await prisma.fabricQualityInspection.create({
    data: { inspectionNumber, itemDescription: d.item_description, weight: d.weight, destinationSector: d.destination_sector, observations: d.observations, defectImageUrl: d.defect_image_url, employeeName: d.employee_name, inspectionDate: d.inspection_date },
  });
  res.status(201).json(inspection);
});

router.put('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;
  await prisma.fabricQualityInspection.update({
    where: { id: parseInt(req.params.id) },
    data: { itemDescription: d.item_description, weight: d.weight, destinationSector: d.destination_sector, observations: d.observations, defectImageUrl: d.defect_image_url, employeeName: d.employee_name, inspectionDate: d.inspection_date },
  });
  res.json({ success: true });
});

router.delete('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.fabricQualityInspection.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;

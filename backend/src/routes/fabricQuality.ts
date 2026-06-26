import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const InspectionSchema = z.object({
  item_description: z.string().min(1),
  weight: z.number().positive(),
  destination_sector: z.string().min(1),
  observations: z.string().optional(),
  defect_image_url: z.string().url().optional().or(z.literal('')),
  employee_name: z.string().min(1),
  inspection_date: z.string().min(1),
});

router.get('/inspections', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const inspections = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  res.json(inspections);
});

router.get('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const inspection = await prisma.fabricQualityInspection.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!inspection) { res.status(404).json({ error: 'Inspeção não encontrada' }); return; }
  res.json(inspection);
});

router.post('/inspections', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = InspectionSchema.parse(req.body);

  const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
  const num = last ? parseInt(last.inspectionNumber.replace('INS-', '')) + 1 : 1;
  const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;

  await prisma.fabricQualityInspection.create({
    data: { inspectionNumber, itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url || null, employeeName: v.employee_name, inspectionDate: v.inspection_date },
  });

  res.status(201).json({ success: true, inspection_number: inspectionNumber });
});

router.put('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = InspectionSchema.parse(req.body);
  await prisma.fabricQualityInspection.update({
    where: { id: parseInt(req.params.id) },
    data: { itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url || null, employeeName: v.employee_name, inspectionDate: v.inspection_date },
  });
  res.json({ success: true });
});

router.delete('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.fabricQualityInspection.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;

import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const CreatePOItemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default("kg"),
  requires_lab: z.boolean().default(false),
  requires_fabric_quality: z.boolean().default(false),
});

export const CreatePOSchema = z.object({
  client: z.string().min(1),
  color: z.string().min(1),
  order_number: z.string().optional(),
  description: z.string().optional(),
  entry_date: z.string().optional(),
  expected_date: z.string().optional(),
  region_jaragua: z.boolean().default(false),
  region_brusque: z.boolean().default(false),
  region_gaspar: z.boolean().default(false),
  fiber_id: z.number().int().optional().nullable(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().int().optional().nullable(),
  items: z.array(CreatePOItemSchema).min(1),
});

export const PreparationSchema = z.object({
  po_id: z.number().int().positive(),
  employee_meters: z.record(z.string(), z.number()),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.array(z.any()),
  total_weight: z.number(),
  destination_box: z.string(),
});

export const BatchPreparationSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.record(z.string(), z.number()),
  splices: z.array(z.any()),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({
    op_id: z.number().int(),
    meters: z.number(),
  })),
});

export const ProductionSchema = z.object({
  po_id: z.number().int().positive(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

export const DryerSchema = z.object({
  po_id: z.number().int().positive(),
  destination: z.string(),
});

export const UntanglingSchema = z.object({
  po_id: z.number().int().positive(),
  num_employees: z.number().int(),
  meters_per_employee: z.number(),
  employee_times: z.array(z.any()),
  start_time: z.string(),
  end_time: z.string(),
});

export const RollingSchema = z.object({
  po_id: z.number().int().positive(),
  employee_ids: z.array(z.number()),
  num_splices: z.number().int(),
  num_rolls: z.number().int(),
  issue_description: z.string().optional().nullable(),
  start_time: z.string(),
  end_time: z.string(),
});

export const QualitySchema = z.object({
  po_id: z.number().int().positive(),
  rolls_sent: z.number().int(),
  meters_per_roll: z.number(),
  discrepancy: z.string().optional().nullable(),
});

export const LaboratorySchema = z.object({
  po_id: z.number().int().positive(),
  num_batches: z.number().int().optional().nullable(),
  is_recipe_ready: z.boolean().default(false),
  recipe_origin_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_approved: z.boolean().default(false),
  start_time: z.string(),
  end_time: z.string(),
});

export const BoxSchema = z.object({
  po_id: z.number().int().positive(),
  employee_id: z.number().int(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional().nullable(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional().nullable(),
  timestamp: z.string(),
});

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1),
  sector: z.string().min(1),
});

export const FabricQualitySchema = z.object({
  item_description: z.string().min(1),
  weight: z.number(),
  destination_sector: z.string(),
  observations: z.string().optional().nullable(),
  defect_image_url: z.string().optional().nullable(),
  employee_name: z.string(),
  inspection_date: z.string(),
});

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["Admin", "PCP", "Almoxarifado", "Laboratorio", "Gerenciamento", "Operador"]),
});

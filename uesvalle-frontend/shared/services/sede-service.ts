import { apiGet } from "@/shared/lib/api-client";

export interface Sede {
  id: number;
  nombre: string;
}

class SedeService {
  async obtenerSedes(): Promise<Sede[]> {
    return apiGet<Sede[]>(`/sedes`);
  }

  async obtenerSedePorId(id: number): Promise<Sede> {
    return apiGet<Sede>(`/sedes/${id}`);
  }
}

export const sedeService = new SedeService();

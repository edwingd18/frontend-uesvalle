import {
  Traslado,
  CreateTrasladoData,
  UpdateTrasladoData,
} from "@/shared/types/traslado";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api-client";

class TrasladosService {
  async getTraslados(): Promise<Traslado[]> {
    return apiGet<Traslado[]>(`/traslados`);
  }

  async getTrasladoById(id: number): Promise<Traslado> {
    return apiGet<Traslado>(`/traslados/${id}`);
  }

  async getTrasladosByActivo(activoId: number): Promise<Traslado[]> {
    return apiGet<Traslado[]>(`/traslados/activo/${activoId}`);
  }

  async createTraslado(data: CreateTrasladoData): Promise<Traslado> {
    return apiPost<Traslado>(`/traslados`, data);
  }

  async updateTraslado(
    id: number,
    data: UpdateTrasladoData
  ): Promise<Traslado> {
    return apiPatch<Traslado>(`/traslados/${id}`, data);
  }

  async deleteTraslado(id: number): Promise<void> {
    return apiDelete<void>(`/traslados/${id}`);
  }
}

export const trasladosService = new TrasladosService();

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  Building2,
  Save,
  Loader2,
  RefreshCw,
  Phone,
} from "lucide-react";
import { usePerfil } from "@/shared/hooks/use-perfil";
import { sedes } from "@/mocks/inventario";
import toast from "react-hot-toast";

const getRoleDisplayName = (role: string) => {
  const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    SYSMAN: "Técnico",
    RESPONSABLE: "Responsable",
  };
  return roleMap[role] || role;
};

const getSedeNombre = (sedeId: number) => {
  return sedes.find((sede) => sede.id === sedeId)?.nombre || `Sede ${sedeId}`;
};

export default function ConfiguracionPage() {
  const { usuario, isLoading, error, refrescarPerfil, actualizarPerfil } =
    usePerfil();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    celular: "",
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        correo: usuario.correo,
        celular: usuario.celular || "",
      });
    }
  }, [usuario]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await actualizarPerfil(formData);
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        correo: usuario.correo,
        celular: usuario.celular || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading && !usuario) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={refrescarPerfil}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">
          No se pudo cargar la información del usuario
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1 px-4 max-w-4xl">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-2">
          Administra tu información personal y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>
                Visualiza y edita tu información personal
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refrescarPerfil}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Nombre Completo
            </Label>
            {isEditing ? (
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ingresa tu nombre completo"
              />
            ) : (
              <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-md">
                {usuario.nombre}
              </p>
            )}
          </div>

          <Separator />

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="correo" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Correo Electrónico
            </Label>
            {isEditing ? (
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                placeholder="Ingresa tu correo electrónico"
              />
            ) : (
              <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-md">
                {usuario.correo}
              </p>
            )}
          </div>

          <Separator />

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="celular" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Número de Teléfono
            </Label>
            {isEditing ? (
              <Input
                id="celular"
                type="tel"
                value={formData.celular}
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value })
                }
                placeholder="Ingresa tu número de teléfono"
              />
            ) : (
              <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-md">
                {usuario.celular || "No especificado"}
              </p>
            )}
          </div>

          <Separator />

          {/* Rol (solo lectura) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              Rol
            </Label>
            <div className="px-3 py-2 bg-orange-50 rounded-md border border-orange-200">
              <p className="text-orange-700 font-medium">
                {getRoleDisplayName(usuario.rol)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Sede (solo lectura) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              Sede
            </Label>
            <div className="px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-blue-700 font-medium">
                {getSedeNombre(usuario.sede_id)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Estado (solo lectura) */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-md">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  usuario.estado === "ACTIVO"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {usuario.estado}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

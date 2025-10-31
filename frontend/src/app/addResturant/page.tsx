"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AddRestaurantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.description) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (!formData.imageUrl) {
      toast.error("Por favor, insira a URL da imagem");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/restaurants", {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        imageUrl: formData.imageUrl,
      });

      toast.success("Restaurante adicionado com sucesso!");
      router.push("/");
    } catch (error: any) {
      console.error("Erro ao adicionar restaurante:", error);
      toast.error(
        error.response?.data?.message || "Erro ao adicionar restaurante"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-8">Adicionar Restaurante</h1>

        <Card className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Área de Preview de Imagem */}
              <div className="flex flex-col">
                <Label className="mb-4">Preview da Imagem</Label>
                <div
                  className="relative border-2 border-dashed border-border rounded-lg flex items-center justify-center"
                  style={{ minHeight: "400px" }}
                >
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div class="flex flex-col items-center justify-center text-muted-foreground p-8"><p>URL de imagem inválida</p></div>';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                      <svg
                        className="h-16 w-16 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-lg">Insira a URL da imagem</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="imageUrl" className="text-lg">
                    URL da Imagem:
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="h-12"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-lg">
                    Nome:
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-12"
                    placeholder="Nome do restaurante"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="location" className="text-lg">
                    Localização
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="h-12"
                    placeholder="Endereço do restaurante"
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="description" className="text-lg">
                    Descrição
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descreva o restaurante..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="px-12 bg-blue-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

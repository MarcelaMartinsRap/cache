"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { RestaurantCarousel } from "@/components/RestaurantCarousel";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  description: string;
  rating?: number;
}

interface SearchSuggestion {
  id: string;
  name: string;
  location?: string;
  type: "nearby" | "featured" | "historic" | "restaurant";
  image?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [topRatedRestaurants, setTopRatedRestaurants] = useState<Restaurant[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();

    // Fechar sugestões ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/restaurants");
      const restaurants = response.data;

      // Simular "Mais perto de você" - primeiros restaurantes
      setNearbyRestaurants(restaurants.slice(0, 8));

      // Simular "Melhores avaliações" - ordenar por rating
      const topRated = [...restaurants]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);
      setTopRatedRestaurants(topRated);
    } catch (error) {
      console.error("Erro ao carregar restaurantes:", error);
      toast.error("Erro ao carregar restaurantes");
      // Dados mockados para desenvolvimento
      const mockRestaurants = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Restaurante ${i + 1}`,
        imageUrl: `https://exemplo.com/imagem${i + 1}.jpg`,
        location: `Endereço ${i + 1}`,
        description: `Descrição do restaurante ${i + 1}`,
        rating: Math.random() * 2 + 3, // Rating entre 3 e 5
      }));
      setNearbyRestaurants(mockRestaurants);
      setTopRatedRestaurants(mockRestaurants);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      toast.info(`Buscando por: ${searchQuery}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      // Simular busca de sugestões
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: "1",
          name: "São Paulo",
          location: "Brasil",
          type: "nearby",
        },
        {
          id: "2",
          name: "Rio de Janeiro",
          location: "Brasil",
          type: "nearby",
        },
        {
          id: "3",
          name: "O melhor de Hong Kong: encontre o itinerário para um dia perfeito",
          type: "featured",
          image: "https://via.placeholder.com/60x60?text=HK",
        },
        {
          id: "4",
          name: "João Pessoa",
          location: "Paraíba, Brasil",
          type: "historic",
          image: "https://via.placeholder.com/60x60?text=JP",
        },
        ...nearbyRestaurants.slice(0, 3).map((r) => ({
          id: r.id,
          name: r.name,
          location: r.location,
          type: "restaurant" as const,
          image: r.imageUrl,
        })),
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    toast.info(`Selecionado: ${suggestion.name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com navegação */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="text-2xl font-bold">Logo</div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/addResturant")}
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Restaurante
              </Button>
              <Button
                size="sm"
                className="rounded-full p-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/login")}
              >
                Fazer login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                size="sm"
                className="rounded-full p-4 bg-blue-600 hover:bg-blue-700"
              >
                Cadastrar
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="py-12 text-center">
            <h1 className="text-5xl font-bold mb-8">Aonde você quer ir?</h1>

            {/* Barra de Pesquisa */}
            <div className="max-w-3xl mx-auto relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Lugares para ir, o que fazer, hotéis..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() =>
                    searchQuery.length > 0 && setShowSuggestions(true)
                  }
                  className="h-14 pl-12 pr-32 text-base rounded-full border-2 border-blue-500 focus:border-blue-700"
                />
                <Button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Buscar
                </Button>
              </div>

              {/* Dropdown de Sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  {/* Botão "Perto de mim" */}
                  <button
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b"
                    onClick={() => {
                      toast.info("Buscando locais próximos...");
                      setShowSuggestions(false);
                    }}
                  >
                    <Navigation className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">
                      Perto de mim
                    </span>
                  </button>

                  {/* Lista de Sugestões */}
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        {suggestion.image ? (
                          <img
                            src={suggestion.image}
                            alt={suggestion.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/60x60?text=Img";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <MapPin className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {suggestion.name}
                          </p>
                          {suggestion.location && (
                            <p className="text-sm text-gray-500 truncate">
                              {suggestion.location}
                            </p>
                          )}
                          {suggestion.type === "featured" && (
                            <p className="text-xs text-gray-400 mt-1">
                              Tripadvisor in partnership with Warner Music
                            </p>
                          )}
                          {suggestion.type === "historic" && (
                            <p className="text-xs text-gray-400 mt-1">
                              Histórico
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Carrossel: Mais perto de você */}
            <RestaurantCarousel
              title="Mais perto de você"
              restaurants={nearbyRestaurants}
            />

            {/* Carrossel: Melhores avaliações */}
            <RestaurantCarousel
              title="Melhores avaliações"
              restaurants={topRatedRestaurants}
            />
          </>
        )}
      </main>
    </div>
  );
}

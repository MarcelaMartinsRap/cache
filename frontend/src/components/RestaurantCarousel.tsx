"use client";

import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  rating?: number;
}

interface RestaurantCarouselProps {
  title: string;
  restaurants: Restaurant[];
}

export function RestaurantCarousel({
  title,
  restaurants,
}: RestaurantCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="min-w-[280px] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="relative h-[200px] bg-muted">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/280x200?text=Sem+Imagem";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">
                {restaurant.name}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {restaurant.rating
                  ? `${restaurant.rating.toFixed(1)} ⭐`
                  : "Sem avaliação"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

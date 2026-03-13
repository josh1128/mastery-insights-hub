"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
}

interface BentoCardProps {
  item: BentoItem;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

function BentoCard({ item, className, onClick, children }: BentoCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300",
        "hover:shadow-glow hover:border-border group",
        item.hasPersistentHover && "shadow-glow border-border",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Top row: icon + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-primary group-hover:shadow-glow transition-all">
          {item.icon}
        </div>
        {item.status && (
          <span className="text-xs font-medium text-muted-foreground border border-border/60 rounded-full px-3 py-1">
            {item.status}
          </span>
        )}
      </div>

      {/* Title + meta */}
      <div className="mb-1.5">
        <h3 className="text-base font-semibold text-foreground leading-tight">
          {item.title}
          {item.meta && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {item.meta}
            </span>
          )}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {item.description}
      </p>

      {/* Bottom row: tags + cta */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-1.5">
          {item.tags?.map((tag, i) => (
            <span
              key={i}
              className="text-xs font-medium text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>
        {item.cta && (
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {item.cta}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
  columns?: number;
  onItemClick?: (item: BentoItem, index: number) => void;
  renderItem?: (item: BentoItem, index: number) => React.ReactNode;
}

function BentoGrid({ items, className, columns = 2, onItemClick, renderItem }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-5",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {items.map((item, index) =>
        renderItem ? (
          renderItem(item, index)
        ) : (
          <BentoCard
            key={index}
            item={item}
            onClick={onItemClick ? () => onItemClick(item, index) : undefined}
            className={item.colSpan === 2 ? "md:col-span-2" : undefined}
          />
        )
      )}
    </div>
  );
}

export { BentoGrid, BentoCard };

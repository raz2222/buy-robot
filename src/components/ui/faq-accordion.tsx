import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/lib/utils";

/**
 * One question open at a time — matches how the rest of the site treats
 * a single focal panel (the quiz's one-question-per-screen, CompareLab's
 * one open table) rather than letting several long answers stack and
 * push the page around.
 */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion.Root type="single" collapsible className={cn("divide-y divide-white/10 border-y border-white/10", className)}>
      {items.map((item, index) => (
        <Accordion.Item key={item.question} value={String(index)}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-start text-sm font-medium sm:text-base">
              {item.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-muted-foreground data-[state=open]:animate-fade-in">
            <p className="pb-5">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

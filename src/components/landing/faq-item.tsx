'use client';

import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  onOpen?: () => void;
}

export function FaqItem({ question, answer, defaultOpen = false, onOpen }: FaqItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) onOpen?.();
  };

  return (
    <Collapsible.Root open={open} onOpenChange={handleOpenChange} className="border-b border-border">
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
        >
          <span className="text-base font-medium text-foreground">{question}</span>
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.span>
        </button>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {open && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">{answer}</p>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  );
}

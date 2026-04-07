import { useState } from "react";
import { Button } from "react-aria-components";
import Typography from "../components/Typography";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "How does Eco Harvest delivery work?",
    answer:
      "Choose your produce, select your schedule, and we deliver fresh, locally grown items right to your door each week.",
  },
  {
    question: "Can I customize my box every week?",
    answer:
      "Yes. You can update your selections before your weekly cutoff so your box always matches your preferences.",
  },
  {
    question: "Where is your produce grown?",
    answer:
      "We source from local hydroponic growers and nearby partner farms focused on sustainable growing practices.",
  },
  {
    question: "Do you offer one-time orders or only subscriptions?",
    answer:
      "You can start with a box and continue weekly. Subscription management is flexible and can be adjusted from your account.",
  },
  {
    question: "What if I need to pause or cancel?",
    answer:
      "No problem. You can pause, skip, or cancel your plan from your account settings without long-term commitments.",
  },
  {
    question: "What if something is missing or damaged?",
    answer:
      "If an issue happens, contact support and we will make it right with a quick resolution or credit when appropriate.",
  },
  {
    question: "Do you deliver to my area?",
    answer:
      "Delivery zones are expanding regularly. Sign in and enter your address during checkout to confirm availability.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us through your account page or email us directly for help with orders, billing, or delivery questions.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(current => (current === index ? null : index));
  };

  return (
    <main className="text-foreground dark:text-secondary-foreground z-10 flex flex-col py-[calc(var(--appSpacing)*2)]">
      <section className="px-appSpacing mx-auto mb-10 max-w-4xl text-center">
        <Typography as="h1" className="text-foreground mb-4 text-4xl font-bold">Frequently Asked Questions</Typography>
        <Typography as="p" className="text-foreground-dimmed3 mx-auto max-w-2xl text-lg">
          Everything you need to know about subscriptions, deliveries, and managing your Eco Harvest
          box.
        </Typography>
      </section>

      <section className="px-appSpacing mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-md backdrop-blur-lg"
              >
                <Button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  onPress={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <Typography as="h2" className="text-foreground text-lg font-medium">{item.question}</Typography>
                  <Typography as="span" className="text-foreground-dimmed3 w-5 text-center text-xl leading-none">
                    {isOpen ? "-" : "+"}
                  </Typography>
                </Button>
                {isOpen ? (
                  <Typography as="p" className="text-foreground-dimmed3 border-t border-white/10 px-5 py-4">
                    {item.answer}
                  </Typography>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

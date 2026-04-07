import { Link } from "react-router-dom";
import Plant from "../assets/svgs/plant.svg?react";
import Package from "../assets/svgs/package.svg?react";
import Truck from "../assets/svgs/truck.svg?react";
import Typography from "../components/Typography";

export default function Home() {
  return (
    <div className="z-10 flex h-full w-full grow flex-col gap-[calc(var(--appSpacing)*2)]">
      {/* Hero Section */}
      <section className="px-appSpacing max-w-9xl relative mx-auto flex h-fit w-full flex-col items-center justify-between gap-[calc(var(--appSpacing)*2)] py-[calc(var(--appSpacing)*2)] md:mt-auto md:flex-row">
        <div className="gap-appSpacing relative mx-auto flex min-h-[stretch] w-full grow flex-col justify-between">
          <div className="gap-appSpacing flex w-full grow flex-col text-left">
            <Typography as="h1" className="text-3xl font-semibold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Fresh. Local. Organic.
            </Typography>
            <Typography as="p" className="text-foreground-dimmed2 max-w-2xl text-lg lg:text-xl lg:leading-[1.75]">
              Build your custom produce box in minutes and get peak-fresh, locally grown veggies
              delivered right to your door.
            </Typography>
          </div>
          <Link to="/build-your-box" className="btn-secondary mt-auto w-fit px-8 py-3">
            Get Started
          </Link>
        </div>

        {/* How It Works */}
        <div className="p-appInnerSpacing flex flex-col items-start gap-8 rounded-2xl bg-white/10 text-left shadow-md backdrop-blur-lg">
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-3 text-white backdrop-blur-lg">
              <Plant className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" className="text-foreground text-xl font-medium">We Grow</Typography>
              <Typography as="p" className="text-foreground-dimmed2">
                Locally grown and harvested at peak flavor and nutrition.
              </Typography>
            </div>
          </div>
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-3 text-white backdrop-blur-lg">
              <Package className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" className="text-foreground text-xl font-medium">We Pack</Typography>
              <Typography as="p" className="text-foreground-dimmed2">
                You pick your favorites, and we hand-pack your box for freshness and zero guesswork.
              </Typography>
            </div>
          </div>
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-3 text-white backdrop-blur-lg">
              <Truck className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" className="text-foreground text-xl font-medium">We Deliver</Typography>
              <Typography as="p" className="text-foreground-dimmed2">
                Reliable weekly delivery means healthy meals are always within reach.
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

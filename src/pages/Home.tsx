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
        <div className="gap-appSpacing relative mx-auto flex w-full grow flex-col justify-between md:min-h-[stretch]">
          <div className="gap-appSpacing flex w-full flex-col text-left md:grow">
            <Typography as="h1" variant="display">
              Fresh. Local. Organic.
            </Typography>
            <Typography as="p" variant="muted" className="max-w-2xl lg:leading-[1.75]">
              Build your custom produce box in minutes and get peak-fresh, locally grown veggies
              delivered right to your door.
            </Typography>
          </div>
          <Link to="/build-your-box" className="btn-secondary mt-auto w-fit px-8 py-3">
            Get Started
          </Link>
        </div>

        {/* How It Works */}
        <div className="p-appInnerSpacing flex flex-col items-start gap-8 rounded-2xl border border-white/10 bg-white/10 text-left shadow-md backdrop-blur-lg">
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-2 text-white backdrop-blur-lg md:p-3">
              <Plant className="size-6 md:size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" displayAs="h3">
                We Grow
              </Typography>
              <Typography as="p" variant="muted">
                Locally grown and harvested at peak flavor and nutrition.
              </Typography>
            </div>
          </div>
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-2 text-white backdrop-blur-lg md:p-3">
              <Package className="size-6 md:size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" displayAs="h3">
                We Pack
              </Typography>
              <Typography as="p" variant="muted">
                You pick your favorites, and we hand-pack your box for freshness and zero guesswork.
              </Typography>
            </div>
          </div>
          <div className="gap-appInnerSpacing flex">
            <div className="flex size-fit items-center justify-center rounded-full bg-yellow-500 p-2 text-white backdrop-blur-lg md:p-3">
              <Truck className="size-6 md:size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography as="h2" displayAs="h3">
                We Deliver
              </Typography>
              <Typography as="p" variant="muted">
                Reliable weekly delivery means healthy meals are always within reach.
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

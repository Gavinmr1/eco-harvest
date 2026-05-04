import ReviewCarousel from "../components/ReviewCarousel";
import PackageIcon from "../assets/svgs/package.svg?react";
import WaterIcon from "../assets/svgs/water.svg?react";
import CompassIcon from "../assets/svgs/compass.svg?react";
import LeafIcon from "../assets/svgs/leaf.svg?react";
import PageHeader from "../components/PageHeader";
import Typography from "../components/Typography";

export default function About() {
  return (
    <main className="text-foreground gap-appSpacing dark:text-secondary-foreground z-10 flex flex-col py-[calc(var(--appSpacing)*2)]">
      <PageHeader
        title="About Eco Harvest"
        subtitle="Eco Harvest is a local, sustainable hydroponic farm committed to delivering fresh, organic produce straight to your door. Our mission is to make healthy eating easy, accessible, and environmentally friendly."
      />

      <section className="gap-appInnerSpacing relative flex">
        <div className="px-appSpacing gap-appInnerSpacing mx-auto grid max-w-4xl md:grid-cols-2">
          <div className="p-appInnerSpacing relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-md backdrop-blur-lg transition-shadow duration-300 hover:shadow-lg">
            <Typography as="h2" displayAs="h3" className="mb-2">
              Our Mission
            </Typography>
            <Typography as="p" variant="muted">
              We believe in nurturing both people and the planet. That’s why we use sustainable
              farming methods, reduce waste through thoughtful packaging, and grow everything
              locally with love and care.
            </Typography>
            <LeafIcon className="absolute right-[0%] bottom-[-40%] mt-4 size-50 text-white opacity-5" />
          </div>

          <div className="p-appInnerSpacing relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-md backdrop-blur-lg transition-shadow duration-300 hover:shadow-lg">
            <Typography as="h2" displayAs="h3" className="mb-2">
              Why Hydroponics?
            </Typography>
            <Typography as="p" variant="muted">
              Hydroponic farming allows us to grow high-quality, nutrient-rich produce using 90%
              less water than traditional agriculture. It’s clean, efficient, and perfect for
              year-round farming—rain or shine.
            </Typography>
            <WaterIcon className="absolute right-[0%] bottom-[-40%] mt-4 size-50 text-white opacity-5" />
          </div>

          <div className="p-appInnerSpacing relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-md backdrop-blur-lg transition-shadow duration-300 hover:shadow-lg">
            <Typography as="h2" displayAs="h3" className="mb-2">
              Local & Fresh
            </Typography>
            <Typography as="p" variant="muted">
              Based right here in your community, we harvest your box the same day we deliver it. It
              doesn’t get any fresher than that.
            </Typography>
            <CompassIcon className="absolute right-[0%] bottom-[-40%] mt-4 size-50 text-white opacity-5" />
          </div>

          <div className="p-appInnerSpacing relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-md backdrop-blur-lg transition-shadow duration-300 hover:shadow-lg">
            <Typography as="h2" displayAs="h3" className="mb-2">
              Our Commitment
            </Typography>
            <Typography as="p" variant="muted">
              From eco-friendly packaging to supporting local causes, we’re all about giving back.
              When you subscribe, you’re helping us build a more sustainable future together.
            </Typography>
            <PackageIcon className="absolute right-[0%] bottom-[-40%] mt-4 size-50 text-white opacity-5" />
          </div>
        </div>
      </section>

      <section className="gap-appInnerSpacing relative flex w-full flex-col pt-[calc(var(--appSpacing)*2)]">
        <Typography as="h2" className="text-center">
          Why Families Keep Coming Back
        </Typography>
        <ReviewCarousel />
      </section>
    </main>
  );
}

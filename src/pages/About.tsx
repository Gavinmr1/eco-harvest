import ReviewCarousel from "../components/ReviewCarousel";

export default function About() {
  return (
    <main className="text-foreground dark:text-secondary-foreground mx-auto flex max-w-4xl flex-col px-4 py-16">
      <section className="mb-12 text-center">
        <h1 className="text-primary mb-4 text-4xl font-bold">About Eco Harvest</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Eco Harvest is a local, sustainable hydroponic farm committed to delivering fresh, organic
          produce straight to your door. Our mission is to make healthy eating easy, accessible, and
          environmentally friendly.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h2 className="text-primary mb-2 text-2xl font-semibold">Our Mission</h2>
          <p>
            We believe in nurturing both people and the planet. That’s why we use sustainable
            farming methods, reduce waste through thoughtful packaging, and grow everything locally
            with love and care.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h2 className="text-primary mb-2 text-2xl font-semibold">Why Hydroponics?</h2>
          <p>
            Hydroponic farming allows us to grow high-quality, nutrient-rich produce using 90% less
            water than traditional agriculture. It’s clean, efficient, and perfect for year-round
            farming—rain or shine.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h2 className="text-primary mb-2 text-2xl font-semibold">Local & Fresh</h2>
          <p>
            Based right here in your community, we harvest your box the same day we deliver it. It
            doesn’t get any fresher than that.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h2 className="text-primary mb-2 text-2xl font-semibold">Our Commitment</h2>
          <p>
            From eco-friendly packaging to supporting local causes, we’re all about giving back.
            When you subscribe, you’re helping us build a more sustainable future together.
          </p>
        </div>
      </section>

      <section className="gap-appInnerSpacing py-appSpacing flex flex-col">
        <h2 className="text-primary text-center text-2xl font-bold">
          Why Families Keep Coming Back
        </h2>
        <ReviewCarousel />
      </section>
    </main>
  );
}

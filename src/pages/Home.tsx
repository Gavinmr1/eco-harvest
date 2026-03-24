import { Link } from "react-router-dom";
import ReviewCarousel from "../components/ReviewCarousel";
import veggiesBgImage from "../assets/images/veggies-bg.webp";
import veggieBoxImage from "../assets/images/veggie-box.webp";

export default function Home() {
  return (
    <div className="gap-appSpacing flex w-full flex-col">
      {/* Hero Section */}
      <section className="px-appSpacing relative items-center justify-center py-[calc(var(--appSpacing)*2)]">
        <div className="max-w-9xl relative z-10 flex w-full flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-bold text-white">Fresh. Local. Organic.</h1>
          <p className="text-xl text-gray-100">
            Get farm-fresh produce delivered to your door every week.
          </p>
          <Link to="/build-your-box" className="btn-primary w-fit">
            Get Started
          </Link>
        </div>
        <div
          className="mask-fade absolute top-0 left-0 z-0 h-full w-full bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${veggiesBgImage})` }}
        />
      </section>

      {/* How It Works */}
      <section className="gap-appSpacing p-appSpacing max-w-9xl flex w-full flex-col items-center justify-center md:flex-row">
        <img src={veggieBoxImage} alt="Harvesting" className="max-w-96 shadow-lg" />
        <div className="gap-appInnerSpacing flex flex-col text-left">
          <div className="flex flex-col gap-2">
            <h2 className="text-primary text-2xl font-semibold">🌱 We Grow</h2>
            <p className="text-foreground">
              Organic produce grown locally with hydroponic technology.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-primary text-2xl font-semibold">📦 We Pack</h2>
            <p className="text-foreground">
              Hand-picked, packed fresh, and customized just for you.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-primary text-2xl font-semibold">🚚 We Deliver</h2>
            <p className="text-foreground">Convenient weekly deliveries right to your doorstep.</p>
          </div>
        </div>
      </section>

      <section className="gap-appInnerSpacing py-appSpacing flex flex-col">
        <h2 className="text-primary text-center text-2xl font-bold">What Our Customers Say</h2>
        <ReviewCarousel />
      </section>
    </div>
  );
}

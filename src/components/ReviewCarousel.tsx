import Slider from "react-slick";
import Typography from "./Typography";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const reviews = [
  {
    name: "Alice Johnson",
    review: "Eco Harvest has changed my life! Their products are fantastic.",
    rating: 5,
  },
  {
    name: "Bob Smith",
    review: "Great quality and fast delivery. Highly recommend!",
    rating: 4,
  },
  {
    name: "Cathy Brown",
    review: "I love their commitment to sustainability. Will definitely buy again!",
    rating: 5,
  },
  {
    name: "David Wilson",
    review: "Excellent customer service and great products.",
    rating: 5,
  },
  {
    name: "Eva Green",
    review: "A reliable source for eco-friendly products!",
    rating: 4,
  },
  {
    name: "Frank White",
    review: "Their selection is impressive. Very satisfied with my purchase!",
    rating: 5,
  },
];

const ReviewCarousel = () => {
  const settings = {
    dots: false,
    arrows: false, // hides left/right arrows
    infinite: true,
    speed: 10000, // smooth slow transition
    autoplay: true,
    autoplaySpeed: 0, // makes it scroll continuously
    cssEase: "linear", // ensures smooth linear scroll
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: false,
    variableWidth: true, // key option
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings} className="[&_>_.slick-list_>_.slick-track]:py-4">
      {reviews.map((review, index) => (
        <div key={index} className="flex h-40 px-2">
          <div className="flex h-full w-fit cursor-pointer flex-col justify-between gap-2 rounded-2xl bg-white/10 bg-linear-to-b p-6 shadow-md backdrop-blur-lg transition-all duration-300 hover:shadow-lg">
            <div className="flex w-70 flex-col gap-2">
              <Typography as="h3" className="text-foreground text-lg font-semibold">{review.name}</Typography>
              <Typography as="p" className="text-foreground-dimmed2 line-clamp-2">{review.review}</Typography>
            </div>
            <div className="text-lg text-yellow-500">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default ReviewCarousel;

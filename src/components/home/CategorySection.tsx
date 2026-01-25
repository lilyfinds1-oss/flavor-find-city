import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const categories = [
  { name: "Steak & Grills", slug: "steak", icon: "🥩", count: 45 },
  { name: "Desi Food", slug: "desi", icon: "🍛", count: 78 },
  { name: "Italian", slug: "italian", icon: "🍝", count: 52 },
  { name: "BBQ", slug: "bbq", icon: "🍖", count: 34 },
  { name: "Cafes & Coffee", slug: "cafes", icon: "☕", count: 89 },
  { name: "Burgers", slug: "burgers", icon: "🍔", count: 67 },
  { name: "Sushi & Japanese", slug: "japanese", icon: "🍣", count: 41 },
  { name: "Middle Eastern", slug: "middle-eastern", icon: "🧆", count: 56 },
  { name: "Pizza", slug: "pizza", icon: "🍕", count: 43 },
  { name: "Halal", slug: "halal", icon: "🥙", count: 92 },
];

export function CategorySection() {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore top restaurants in every cuisine
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/lists/${category.slug}`}
              className="group relative flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border/50 card-hover text-center"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </span>
              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {category.count} places
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            View all categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

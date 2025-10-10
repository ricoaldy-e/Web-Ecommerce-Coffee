import HeroVideo from "@/components/home/HeroVideo"
import BestSellers from "@/components/home/BestSellers"
import USP from "@/components/home/USP"
import StoreLocation from "@/components/home/StoreLocation" // ⬅️ tambah ini

export const metadata = { title: "Coffee • Home" }

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <BestSellers title="Best Sellers" />
      <USP />
      <StoreLocation />
    </>
  )
}
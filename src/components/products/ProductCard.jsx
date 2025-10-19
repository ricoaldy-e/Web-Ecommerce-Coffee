"use client"

import { useState } from "react"
import { ShoppingCart, CreditCard, Award, Plus, Minus, X } from "lucide-react"

export default function ProductCard({ 
  p, 
  onAddToCart,
  onBuyNow,
  isLoggedIn = false
}) {
  const price = Number(p.price ?? 0)
  const img = p.image || "/placeholder-product.jpg"
  const soldOut = p.stock <= 0
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("") // "cart" atau "buy"
  const [quantity, setQuantity] = useState(1)

  const handleAddToCartClick = () => {
    if (!isLoggedIn) {
      alert("❌ Login terlebih dahulu untuk menambahkan ke keranjang")
      window.location.href = "/auth/login"
      return
    }
    setModalType("cart")
    setShowModal(true)
  }

  const handleBuyNowClick = () => {
    if (!isLoggedIn) {
      alert("❌ Login terlebih dahulu untuk membeli produk")
      window.location.href = "/auth/login"
      return
    }
    setModalType("buy")
    setShowModal(true)
  }

  const increaseQuantity = () => {
    if (quantity < p.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleConfirm = () => {
    if (modalType === "cart" && onAddToCart) {
      onAddToCart(p, quantity)
    } else if (modalType === "buy" && onBuyNow) {
      onBuyNow(p, quantity)
    }
    closeModal()
  }

  const closeModal = () => {
    setShowModal(false)
    setQuantity(1)
    setModalType("")
  }

  return (
    <>
      <div
        className={`group rounded-2xl overflow-hidden border border-amber-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300
                    ${soldOut ? "opacity-60" : "hover:scale-105"}`}
      >
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden bg-amber-100">
            <img
              src={img}
              alt={p.name}
              className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          </div>
          
          {/* Best Seller Badge */}
          {p.isBestSeller && (
            <div className="absolute top-2 left-2 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
              <Award className="w-3 h-3 inline mr-1" />
              Best
            </div>
          )}
          
          {/* Sold Out Badge */}
          {soldOut && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              HABIS
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="line-clamp-2 font-bold text-gray-900 text-base mb-2 leading-tight">
            {p.name}
          </div>

          <div className="text-amber-700 font-bold text-lg mb-3">
            Rp {price.toLocaleString("id-ID")}
          </div>

          {/* Stock and Sold Info */}
          <div className="text-xs text-gray-600 mb-4 font-medium text-center">
            Terjual {p.sold} | Stok {p.stock}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleAddToCartClick}
              disabled={soldOut}
              className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Keranjang
            </button>
            <button
              onClick={handleBuyNowClick}
              disabled={soldOut}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-700 to-amber-800 rounded-lg text-white text-sm font-semibold hover:from-amber-800 hover:to-amber-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Beli
            </button>
          </div>
        </div>
      </div>

      {/* Modal Quantity Selector */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={img}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-amber-900 text-center">{p.name}</h2>
                
                {/* Description */}
                <p className="text-gray-600 text-sm text-center mt-3">
                  {p.desc}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4 p-3 bg-amber-50 rounded-lg">
                  <span className="font-semibold text-amber-800">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center text-amber-900">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= p.stock}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-800">
                      {modalType === "cart" ? "Subtotal:" : "Total Pembayaran:"}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-amber-700">
                        Rp {(price * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    onClick={handleConfirm}
                    disabled={p.stock <= 0}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {modalType === "cart" ? (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Tambah ke Keranjang ({quantity})
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Beli Sekarang ({quantity})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Home, Loader2, Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    setIsSubmitting(true);

    const orderDetails = {
      customer: { name, phone, address, notes },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalPrice,
      paymentMethod,
    };

    console.log("--- New Checkout Order ---", orderDetails);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Đặt hàng thành công!");
    clearCart();
    router.push("/order/success");
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 mt-2">
          Hãy thêm sản phẩm vào giỏ để tiến hành đặt hàng.
        </p>
        <Button onClick={() => router.push("/products")} className="mt-6">
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 animate-in fade-in-0 duration-500">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">
          Thanh toán
        </h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info */}
            <Card className="bg-white shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle>1. Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ nhận hàng</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-white shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle>2. Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="cod"
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors data-[state=checked]:border-primary"
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="ml-4">
                      <p className="font-semibold">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-sm text-gray-500">
                        Trả tiền mặt khi shipper giao hàng.
                      </p>
                    </div>
                    <Wallet className="h-6 w-6 ml-auto text-gray-600" />
                  </Label>
                  <Label
                    htmlFor="bank"
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors data-[state=checked]:border-primary"
                  >
                    <RadioGroupItem value="bank" id="bank" />
                    <div className="ml-4">
                      <p className="font-semibold">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-500">
                        Chúng tôi sẽ gửi thông tin chuyển khoản sau khi bạn đặt
                        hàng.
                      </p>
                    </div>
                    <Landmark className="h-6 w-6 ml-auto text-gray-600" />
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-white shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 text-sm"
                    >
                      <div className="w-16 h-16 rounded-md bg-white border p-1 flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-baseline font-bold">
                  <span className="text-lg">Tổng cộng</span>
                  <span className="text-2xl text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6 h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Hoàn tất đặt hàng"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}

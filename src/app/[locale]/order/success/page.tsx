"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Đặt hàng thành công!</h1>
      <p className="text-gray-600 mt-3 max-w-md mx-auto">
        Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận và chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
      </p>
      <Button 
        onClick={() => router.push('/products')}
        className="mt-8"
        size="lg"
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}

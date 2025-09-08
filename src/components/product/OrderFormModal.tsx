"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    quantity: number;
  };
}

export default function OrderFormModal({ open, onClose, product }: OrderFormModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    setIsSubmitting(true);

    const orderDetails = {
      productName: product.name,
      quantity: product.quantity,
      pricePerItem: product.price,
      total: product.price * product.quantity,
      customerName: name,
      phone,
      address,
      notes,
    };

    console.log('--- New Quick Order ---', orderDetails);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    setIsSubmitting(false);
    onClose();
    // Reset form
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Xác nhận đặt hàng nhanh</DialogTitle>
          <DialogDescription>
            Vui lòng điền thông tin bên dưới để hoàn tất đơn hàng.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className='p-3 bg-slate-50 rounded-md border'>
            <p className='font-semibold'>{product.name}</p>
            <p className='text-sm text-gray-600'>Số lượng: {product.quantity}</p>
            <p className='text-sm text-gray-600'>Tổng cộng: <span className='font-bold text-primary'>{formatCurrency(product.price * product.quantity)}</span></p>
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Họ và tên <span className="text-red-500">*</span></label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Địa chỉ nhận hàng <span className="text-red-500">*</span></label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Ghi chú (tùy chọn)</label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ví dụ: Giao hàng trong giờ hành chính" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

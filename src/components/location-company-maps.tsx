import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";

export const MapsLocationCompany = () => {
  return (
    <div className="container mx-auto mb-30">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        // className="w-full"
      >
        <div className="bg-white  shadow-xl overflow-hidden border border-stone-100 flex flex-col md:flex-row min-h-[450px]">
          {/* Cột Thông Tin Vị Trí */}
          <div className="md:w-1/3 bg-rose-50 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative Circle */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-widest uppercase text-xs">
                  Vị Trí
                </span>
              </div>

              <h3 className="text-3xl font-heading font-bold text-slate-900 mb-4">
                Ghé thăm Công Ty Chúng Tôi
              </h3>

              <p className="font-body text-slate-600 mb-8 text-sm leading-relaxed">
                LALA-LYCHEEE nằm ngay tại trung tâm vùng đất vải thiều trứ danh.
                Hãy đến để cảm nhận hương vị tươi ngon tận vườn.
              </p>

              <div className="space-y-4 font-body text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    Vĩnh Lập – Thanh Hà – Hải Dương (địa chỉ hành chính cũ)
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span>Thôn Tú - Xã Hà Đông - Thành Phố Hải Phòng</span>
                    <div className="font-bold italic">
                      (địa chỉ hành chính mới)
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="https://maps.google.com?q=LALA-LYCHEEE"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-rose-600 px-6 py-3 rounded-full transition-colors duration-300 text-sm font-medium w-fit group"
              >
                <Navigation className="w-4 h-4 group-hover:animate-bounce" />
                Chỉ đường Google Maps
              </Link>
            </div>
          </div>

          {/* Cột Bản Đồ Google Map */}
          <div className="md:w-2/3 relative h-[400px] md:h-auto bg-stone-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d328.8131806159285!2d106.49132371003373!3d20.810141254928457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x437742396b4f2dcd%3A0xd03a9e098934bdcf!2sLALA-LYCHEEE!5e1!3m2!1svi!2s!4v1755225875310!5m2!1svi!2s"
              className="absolute inset-0 w-full h-full"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "grayscale(20%) contrast(1.2) opacity(0.9)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LALA-LYCHEEE Location"
            />
            {/* Map Overlay Gradient (Optional - bỏ nếu muốn map rõ 100%) */}
            <div className="absolute pointer-events-none inset-0 bg-rose-900/5 mix-blend-multiply" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

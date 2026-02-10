'use client';

import Image from 'next/image';

type Props = {
  uniqueCode: string;
  totalAmount: string;
  orderNumber: string;
};

export function BankTransferInstructions({ uniqueCode, totalAmount, orderNumber }: Props) {
  // Parse the total amount (remove "Rp" and convert to number)
  const cleanAmount = totalAmount.replace(/[^0-9]/g, '');
  const formattedAmount = `Rp ${parseInt(cleanAmount).toLocaleString('id-ID')}`;

  return (
    <div className="bg-gray-50 p-8 mb-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2 text-yellow-900">
            Transfer Bank Diperlukan
          </h2>
          <p className="text-sm text-yellow-800 leading-relaxed">
            Pesanan Anda telah diterima. Silakan selesaikan pembayaran dengan mentransfer <strong>jumlah tepat</strong> yang ditampilkan di bawah ini ke rekening bank kami.
          </p>
        </div>
      </div>

      {/* Transfer Amount with Unique Code */}
      <div className="bg-white p-6 mb-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
            Transfer Jumlah Tepat
          </p>
          <p className="text-4xl font-bold text-black mb-4">
            {formattedAmount}
          </p>
          <div className="inline-block bg-yellow-100 border border-yellow-600 px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Kode Unik Anda
            </p>
            <p className="text-2xl font-bold text-yellow-900 tracking-wider">
              {uniqueCode}
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-300 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-900 mb-2">
          ⚠️ Penting
        </h3>
        <ul className="text-xs text-red-800 space-y-1 leading-relaxed">
          <li>• Kode unik <strong>({uniqueCode})</strong> sudah termasuk dalam total di atas</li>
          <li>• Transfer <strong>jumlah tepat</strong> yang ditampilkan - jangan dibulatkan</li>
          <li>• Kode unik membantu kami mengidentifikasi pembayaran Anda secara otomatis</li>
          <li>• Pesanan akan diproses setelah pembayaran dikonfirmasi (biasanya 1-2 jam)</li>
          <li>• Simpan halaman ini atau screenshot untuk referensi Anda</li>
        </ul>
      </div>
    </div>
  );
}

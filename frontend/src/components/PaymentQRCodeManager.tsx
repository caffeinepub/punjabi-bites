import { useRef, useState } from 'react';
import { useGetPaymentQRCode, useSetPaymentQRCode } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Upload, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentQRCodeManager() {
  const { data: qrCode, isLoading } = useGetPaymentQRCode();
  const setQRMutation = useSetPaymentQRCode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    try {
      await setQRMutation.mutateAsync(preview);
      toast.success('Payment QR code saved successfully!');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to save QR code. Please try again.');
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayImage = preview ?? qrCode;

  return (
    <Card className="border-saffron/20 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-saffron/15 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <CardTitle className="font-display text-lg font-black text-deepRed">
              Payment QR Code
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Upload a QR code image for customers to scan and pay
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Preview Area */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            {isLoading ? (
              <Skeleton className="w-44 h-44 rounded-xl bg-saffron/10" />
            ) : displayImage ? (
              <div className="relative group">
                <img
                  src={displayImage}
                  alt="Payment QR Code"
                  className="w-44 h-44 object-contain rounded-xl border-2 border-saffron/30 bg-white p-2 shadow-sm"
                />
                {preview && (
                  <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">Preview</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-44 h-44 rounded-xl border-2 border-dashed border-saffron/30 bg-saffron/5 flex flex-col items-center justify-center gap-2">
                <QrCode className="w-10 h-10 text-saffron/40" />
                <span className="text-xs text-gray-400 text-center px-2">No QR code uploaded yet</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {qrCode && !preview && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                <QrCode className="w-4 h-4 shrink-0" />
                <span className="font-medium">QR code is active and visible to customers</span>
              </div>
            )}

            {preview && (
              <div className="flex items-center gap-2 text-sm text-saffron bg-saffron/10 rounded-lg px-3 py-2 border border-saffron/20">
                <ImagePlus className="w-4 h-4 shrink-0" />
                <span className="font-medium">New image selected — click Save to apply</span>
              </div>
            )}

            <p className="text-sm text-gray-500 leading-relaxed">
              Upload a QR code image (PNG, JPG, or SVG). Customers will be able to scan this to make payments.
            </p>

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="qr-file-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-saffron/30 text-deepRed hover:bg-saffron/10 hover:border-saffron gap-2"
                disabled={setQRMutation.isPending}
              >
                <Upload className="w-4 h-4" />
                {qrCode ? 'Replace QR Code' : 'Upload QR Code'}
              </Button>

              {preview && (
                <>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={setQRMutation.isPending}
                    className="bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2"
                  >
                    {setQRMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    {setQRMutation.isPending ? 'Saving…' : 'Save QR Code'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPreview}
                    disabled={setQRMutation.isPending}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import Image from "next/image";
import { Product, ProductVariation } from "@/types/woocommerce";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const { addItem } = useCartStore();

  const variations = product.variations?.nodes || [];
  const galleryImages = [product.image, ...(product.galleryImages?.nodes || [])].filter(Boolean);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["description", "style-fit"]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    const index = emblaApi.selectedScrollSnap();
    setActiveImageIndex(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('select', onScroll);
    emblaApi.on('reInit', onScroll);
  }, [emblaApi, onScroll]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isVariableProduct = variations.length > 0;

  const handleAddToCart = () => {
    if (isVariableProduct && !selectedVariation) {
        toast.error("Please select a size");
        return;
    }

    addItem(product, quantity, selectedVariation);
    toast.success("Added to cart");
  };
  
  // Determine displayed price
  const displayPrice = selectedVariation ? cleanPrice(selectedVariation.price) : (product.price ? cleanPrice(product.price) : formatPrice(0));
  const isOutOfStock = selectedVariation ? selectedVariation.stockStatus === 'OUT_OF_STOCK' : product.stockStatus === 'OUT_OF_STOCK';

  // Breadcrumbs
  const categories = (product.productCategories?.nodes || []).filter(
    (cat) => cat.slug !== "all-products"
  );
  const breadcrumbItems: { label: string; href: string; active?: boolean }[] = [
    { label: "Shop", href: "/shop" },
  ];

  categories.forEach((cat, idx) => {
    breadcrumbItems.push({ 
      label: cat.name, 
      href: `/shop?category=${cat.slug}`,
      active: idx === categories.length - 1
    });
  });

  return (
    <div className="w-full pt-20 md:pt-[120px]">
      <div className="mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-0 lg:gap-12">
          {/* Left Side - Scrollable Image Gallery */}
          <div className="w-full md:py-10 md:bg-white md:-mx-8 lg:-mx-12">
            {/* Mobile: Swipeable Loop Carousel */}
            <div className="md:hidden -mx-6">
              <div className="relative overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={idx}
                      className="relative flex-[0_0_100%] min-w-0"
                    >
                      <div 
                        className="relative aspect-[3/4] w-full bg-white transition-transform"
                        onClick={() => setPreviewImage(img.sourceUrl)}
                      >
                        <Image 
                          src={img.sourceUrl} 
                          alt={img.altText || `${product.name} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          priority={idx < 2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Progress Bar Indicator */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10">
                    <div 
                      className="h-full bg-black transition-all duration-300 ease-out"
                      style={{ 
                        width: `${100 / galleryImages.length}%`,
                        transform: `translateX(${activeImageIndex * 100}%)`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Two-Column Grid */}
            <div className="hidden md:grid grid-cols-2 w-full pl-10 mx-auto bg-white">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  className="relative aspect-[3/4] w-full bg-white overflow-hidden border border-neutral-200 hover:border-primary/50 transition-all cursor-zoom-in"
                  onClick={() => setPreviewImage(img.sourceUrl)}
                >
                  <Image 
                    src={img.sourceUrl} 
                    alt={img.altText || `${product.name} - Image ${idx + 1}`}
                    fill
                    className="object-cover"
                    priority={idx < 2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Sticky Product Information */}
          <div className="lg:sticky lg:top-20 lg:self-start pt-4 pb-8 md:py-10 ">
            <div className="border-b md:border border-black/20 -mx-6 md:mx-0">
              {/* Boxed Breadcrumbs Header */}
              <div className="hidden md:flex border-b border-black/20 bg-white">
                <div className="border-r border-black/20">
                  <Breadcrumbs 
                    items={breadcrumbItems} 
                    variant="boxed"
                  />
                </div>
                <div className="flex-1"></div>
              </div>
              
              <div className="px-6 pt-0 md:pt-6 pb-8 space-y-8">
                {/* Product Title & Price */}
                <div className="space-y-4">
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight uppercase leading-none">
                    {product.name}
                  </h1>
                  <div className="text-lg tracking-wider font-regular text-black">
                    {displayPrice}
                  </div>
                </div>

                {/* Size Selection */}
                {isVariableProduct && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-regular text-black/50 uppercase tracking-wide">SIZES</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                       {variations
                        .map((variant) => {
                          const sizeAttr = variant.attributes?.nodes?.find(
                            attr => attr.name.toLowerCase().includes('size')
                          );
                          const displayName = sizeAttr?.value || variant.name.split('-').pop()?.trim() || variant.name;
                          
                          return {
                            variant,
                            displayName: displayName.toUpperCase(),
                          };
                        })
                        .sort((a, b) => {
                          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                          const indexA = sizeOrder.indexOf(a.displayName);
                          const indexB = sizeOrder.indexOf(b.displayName);
                          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                          if (indexA !== -1) return -1;
                          if (indexB !== -1) return 1;
                          return a.displayName.localeCompare(b.displayName);
                        })
                        .map(({ variant, displayName }) => {
                         const isSelected = selectedVariation?.id === variant.id;
                         const isUnavailable = variant.stockStatus === 'OUT_OF_STOCK';
                         
                         return (
                           <button
                             key={variant.id}
                             onClick={() => !isUnavailable && setSelectedVariation(variant)}
                             className={cn(
                               "h-11 border text-[13px] font-bold transition-all uppercase",
                               isSelected && "bg-black text-white border-black",
                               !isSelected && !isUnavailable && "border-neutral-300 hover:border-black",
                               isUnavailable && "opacity-30 cursor-not-allowed line-through"
                             )}
                             disabled={isUnavailable}
                           >
                             {displayName}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                )}

                {/* Add to Cart Buttons */}
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 bg-black text-white hover:bg-neutral-800 uppercase tracking-wide font-bold text-sm"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>

              {/* Accordion Sections - Now following the industrial style */}
              <div className="border-t border-black/20">
                {/* Description */}
                <AccordionItem 
                  title="Description" 
                  isOpen={openSections.includes('description')} 
                  onClick={() => toggleSection('description')}
                >
                  {product.description ? (
                    <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">
                      No description available.
                    </p>
                  )}
                </AccordionItem>

                {/* Style & Fit */}
                {product.sizeChart?.sizeChart && (
                  <AccordionItem 
                    title="Style & Fit" 
                    isOpen={openSections.includes('style-fit')} 
                    onClick={() => toggleSection('style-fit')}
                  >
                    <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.sizeChart.sizeChart }} 
                    />
                  </AccordionItem>
                )}

                {/* Features */}
                {product.features?.features && (
                  <AccordionItem 
                    title="Features" 
                    isOpen={openSections.includes('features')} 
                    onClick={() => toggleSection('features')}
                  >
                     <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.features.features }} 
                    />
                  </AccordionItem>
                )}

                {/* Care */}
                <AccordionItem 
                  title="Care" 
                  isOpen={openSections.includes('care')} 
                  onClick={() => toggleSection('care')}
                >
                  {product.shortDescription ? (
                     <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.shortDescription }} 
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">
                      Machine wash cold. Do not tumble dry.
                    </p>
                  )}
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog 
        open={!!previewImage} 
        onOpenChange={(open) => {
          if (!open) {
            setPreviewImage(null);
            setIsZoomed(false);
          }
        }}
      >
        <DialogContent 
          showCloseButton={false}
          className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-black/95 shadow-none rounded-none"
        >
          <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          <div className={cn(
            "relative w-full h-full flex items-center justify-center transition-all duration-300",
            isZoomed ? "overflow-auto cursor-zoom-out" : "overflow-hidden cursor-zoom-in"
          )}>
            {previewImage && (
              <div 
                className={cn(
                  "relative transition-all duration-300 ease-in-out",
                  isZoomed ? "min-w-[150%] md:min-w-[110%] py-10" : "w-full h-full flex items-center justify-center p-4"
                )}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={previewImage}
                  alt="Product Preview"
                  width={1600}
                  height={2000}
                  className={cn(
                    "rounded-sm transition-all duration-300",
                    isZoomed ? "w-full h-auto" : "object-contain max-h-[85vh] w-auto h-auto"
                  )}
                  priority
                />
              </div>
            )}
            
            {/* Custom Close Button */}
            <button 
              onClick={() => {
                setPreviewImage(null);
                setIsZoomed(false);
              }}
              className="fixed top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors z-[60]"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Zoom Hint (Optional, only show when not zoomed) */}
            {!isZoomed && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Tap to Zoom
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onClick, children }: AccordionItemProps) {
  return (
    <div className="border-b border-neutral-300 last:border-b-0">
      <button 
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

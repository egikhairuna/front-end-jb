
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Image from "next/image";
import { Product, ProductVariation } from "@/types/woocommerce";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FindMySizeModal } from "@/components/shop/FindMySizeModal";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const { addItem } = useCartStore();

  const variations = product.variations?.nodes || [];
  // Build gallery slides: [featured, first gallery, video?, ...rest gallery]
  const videoUrl = product.productVideos?.productVideos || null;
  const rawImages = [product.image, ...(product.galleryImages?.nodes || [])].filter(Boolean);
  type ImageSlide = { type: "image" } & typeof rawImages[number];
  type VideoSlide = { type: "video"; sourceUrl: string; altText: string };
  type GallerySlide = ImageSlide | VideoSlide;

  const gallerySlides: GallerySlide[] = (() => {
    if (!videoUrl || rawImages.length < 2) {
      return rawImages.map((img) => ({ ...img, type: "image" as const }));
    }
    const [first, second, ...rest] = rawImages;
    return [
      { ...first, type: "image" as const },
      { ...second, type: "image" as const },
      { type: "video" as const, sourceUrl: videoUrl, altText: "Product Video" },
      ...rest.map((img) => ({ ...img, type: "image" as const })),
    ];
  })();

  // Keep galleryImages for progress bar count (same length as gallerySlides)
  const galleryImages = gallerySlides;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  const [modalEmblaRef, modalEmblaApi] = useEmblaCarousel({ loop: true });

  const onModalScroll = useCallback(() => {
    if (!modalEmblaApi) return;
    const index = modalEmblaApi.selectedScrollSnap();
    if (activeImageIndex !== index) setActiveImageIndex(index);
  }, [modalEmblaApi, activeImageIndex]);

  useEffect(() => {
    if (!modalEmblaApi) return;
    modalEmblaApi.on('select', onModalScroll);
    modalEmblaApi.on('reInit', onModalScroll);
  }, [modalEmblaApi, onModalScroll]);

  // Sync modal carousel when external activeImageIndex changes
  useEffect(() => {
    if (modalEmblaApi && isPreviewOpen) {
      if (modalEmblaApi.selectedScrollSnap() !== activeImageIndex) {
         modalEmblaApi.scrollTo(activeImageIndex, true);
      }
    }
  }, [activeImageIndex, modalEmblaApi, isPreviewOpen]);

  // Disable modal embla drag when zoomed
  useEffect(() => {
    if (modalEmblaApi) {
      modalEmblaApi.reInit({ watchDrag: !isZoomed, loop: true });
    }
  }, [isZoomed, modalEmblaApi]);

  const isVariableProduct = variations.length > 0;

  const handleAddToCart = () => {
    if (isVariableProduct && !selectedVariation) {
        toast.error("Please select a size");
        return;
    }

    addItem(product, quantity, selectedVariation);
    toast.success("Added to cart");
  };

  const handleSelectSize = (sizeName: string) => {
    const variation = variations.find(v => {
      const sizeAttr = v.attributes?.nodes?.find(
        attr => attr.name.toLowerCase().includes('size')
      );
      const displayName = sizeAttr?.value || v.name.split('-').pop()?.trim() || v.name;
      return displayName.toUpperCase() === sizeName.toUpperCase();
    });

    if (variation) {
      setSelectedVariation(variation);
      toast.success(`Recommended size ${sizeName} selected`);
    } else {
      toast.error(`Recommended size ${sizeName} is not available`);
    }
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
    <div className="w-full pt-20 lg:pt-[120px]">
      <div className="mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-0 lg:gap-12">
          {/* Left Side - Scrollable Image Gallery */}
          <div className="w-full lg:py-10 lg:bg-white lg:-mx-12">
            {/* Mobile/Tablet: Swipeable Loop Carousel */}
            <div className="lg:hidden -mx-6">
              <div className="relative overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {gallerySlides.map((slide, idx) => (
                    <div 
                      key={idx}
                      className="relative flex-[0_0_100%] min-w-0"
                    >
                      <div 
                        className="relative aspect-[3/4] w-full bg-white transition-transform"
                        onClick={() => {
                          if (slide.type === "image") {
                            setActiveImageIndex(idx);
                            setIsPreviewOpen(true);
                          }
                        }}
                      >
                        {slide.type === "video" ? (
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 w-full h-full object-cover"
                          >
                            <source src={slide.sourceUrl} />
                          </video>
                        ) : (
                          <Image 
                            src={slide.sourceUrl} 
                            alt={slide.altText || `${product.name} - Image ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx < 2}
                          />
                        )}
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
            <div className="hidden lg:grid grid-cols-2 w-full pl-10 mx-auto bg-white">
              {gallerySlides.map((slide, idx) => (
                <div 
                  key={idx}
                  className="relative aspect-[3/4] w-full bg-white overflow-hidden border border-neutral-200 hover:border-primary/50 transition-all"
                  onClick={() => {
                    if (slide.type === "image") {
                      setActiveImageIndex(idx);
                      setIsPreviewOpen(true);
                    }
                  }}
                  style={{ cursor: slide.type === "image" ? "zoom-in" : "default" }}
                >
                  {slide.type === "video" ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={slide.sourceUrl} />
                    </video>
                  ) : (
                    <Image 
                      src={slide.sourceUrl} 
                      alt={slide.altText || `${product.name} - Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      priority={idx < 2}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Sticky Product Information */}
          <div className="lg:sticky lg:top-20 lg:self-start pt-4 pb-0 lg:pb-8 lg:py-10 ">
            <div className="border-b lg:border border-black/20 -mx-6 lg:mx-0">
              {/* Boxed Breadcrumbs Header */}
              <div className="hidden lg:flex border-b border-black/20 bg-white">
                <div className="border-r border-black/20">
                  <Breadcrumbs 
                    items={breadcrumbItems} 
                    variant="boxed"
                  />
                </div>
                <div className="flex-1"></div>
              </div>
              
              <div className="px-6 pt-0 lg:pt-6 pb-6 space-y-8">
                {/* Product Title & Price */}
                <div className="space-y-2">
                  <h1 className="text-[16px] lg:text-2xl font-medium uppercase leading-none">
                    {product.name}
                  </h1>
                  <div className="text-[16px] font-medium text-black">
                    {displayPrice}
                  </div>
                </div>

                {/* Size Selection */}
                {isVariableProduct && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-regular text-black/50 uppercase tracking-wide">SIZE</span>
                      <button 
                        onClick={() => setIsSizeModalOpen(true)}
                        className="text-[11px] font-regular text-black border-b border-black hover:opacity-70 transition-opacity uppercase tracking-wide cursor-pointer"
                      >
                        Find My Size
                      </button>
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
                               "h-11 border text-[13px] font-bold transition-all uppercase cursor-pointer",
                               isSelected && "bg-black text-white border-black",
                               !isSelected && !isUnavailable && "border-black hover:border-black",
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
                    className="w-full h-14 bg-black text-white hover:bg-neutral-800 uppercase tracking-wide font-medium cursor-pointer text-sm"
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
                      className="text-[14px] leading-snug text-black/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                  ) : (
                    <p className="text-[14px] leading-snug">
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
                      className="text-[14px] leading-snug text-black/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
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
                      className="text-[14px] leading-snug text-black/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
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
                      className="text-[14px] leading-snug text-black/70 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{ __html: product.shortDescription }} 
                    />
                  ) : (
                    <p className="text-[14px] leading-snug">
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
        open={isPreviewOpen} 
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) setIsZoomed(false);
        }}
      >
        <DialogContent 
          showCloseButton={false}
          className="max-w-[100vw] sm:max-w-[100vw] !m-0 !p-0 w-full h-[100vh] sm:h-[100vh] border-none bg-white shadow-none rounded-none flex flex-col z-[203] overflow-hidden"
        >
          <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          
          {/* Top Bar - Premium Minimalist with Border */}
          <div className="flex justify-end items-center px-6 lg:px-12 py-4 border-b border-black/10 bg-white z-[204]">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="flex items-center gap-2 group transition-opacity hover:opacity-60"
            >
              <span className="text-[12px] lg:text-[13px] tracking-[0.2em] font-medium uppercase">CLOSE</span>
              <X className="w-5 h-5 font-light" strokeWidth={1} />
            </button>
          </div>

          <div className="flex-1 relative flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Main Zoomable Image Area (Desktop) */}
            <div className="hidden lg:flex flex-1 relative w-full h-full overflow-hidden items-center justify-center p-20">
              <div className="absolute inset-0 bg-white" />
              {gallerySlides[activeImageIndex]?.type === "image" && (
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={2}
                  centerOnInit
                  doubleClick={{ disabled: false, mode: "toggle" }}
                  onZoom={() => setIsZoomed(true)}
                  onZoomStop={(ref) => setIsZoomed(ref.state.scale > 1)}
                >
                  {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <div 
                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                        onClick={() => {
                          if (window.innerWidth > 1024 && !isZoomed) zoomIn(0.5);
                          else if (window.innerWidth > 1024 && isZoomed) resetTransform();
                        }}
                      >
                        <Image
                          src={gallerySlides[activeImageIndex].sourceUrl}
                          alt="Product Preview"
                          width={1600}
                          height={2000}
                          className="object-contain max-h-full w-auto select-none"
                          priority
                        />
                      </div>
                    </TransformComponent>
                  )}
                </TransformWrapper>
              )}
            </div>

            {/* Main Zoomable Image Area (Mobile Swipeable) */}
            <div className="flex lg:hidden flex-1 relative w-full h-full overflow-hidden" ref={modalEmblaRef}>
              <div className="absolute inset-0 bg-white" />
              <div className="flex w-full h-full">
                {gallerySlides.map((slide, idx) => (
                  <div key={idx} className="relative flex-[0_0_100%] max-w-full min-w-0 h-full">
                     {slide.type === "image" && (
                        <TransformWrapper
                          initialScale={1}
                          minScale={1}
                          maxScale={2}
                          centerOnInit
                          onZoom={() => setIsZoomed(true)}
                          onZoomStop={(ref) => setIsZoomed(ref.state.scale > 1)}
                          panning={{ disabled: !isZoomed }}
                        >
                          {({ zoomIn, zoomOut, resetTransform }) => (
                            <TransformComponent
                              wrapperClass="!w-full !h-full"
                              contentClass="!w-full !h-full flex items-center justify-center"
                            >
                              <div className="relative w-full h-full flex items-center justify-center p-4">
                                <Image
                                  src={slide.sourceUrl}
                                  alt={`Product Preview ${idx}`}
                                  width={1600}
                                  height={2000}
                                  className="object-contain max-h-full w-auto select-none pointer-events-none"
                                  priority={idx === activeImageIndex}
                                />
                              </div>
                            </TransformComponent>
                          )}
                        </TransformWrapper>
                     )}
                     {slide.type === "video" && (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain pointer-events-none"
                          >
                            <source src={slide.sourceUrl} />
                          </video>
                        </div>
                     )}
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnail Navigator (lg: Vertical Strip on Right, Mobile: Bottom Strip) */}
            <div className={cn(
               "lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:w-32 z-[206]",
               "w-full px-6 py-4 lg:p-0 bg-white lg:bg-transparent"
            )}>
              <div className="flex lg:flex-col justify-center items-center gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {gallerySlides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 bg-[#E5E1D8] overflow-hidden transition-all duration-300",
                      activeImageIndex === idx 
                        ? "ring-1 ring-black ring-offset-2 opacity-100 scale-105 shadow-md" 
                        : "opacity-40 hover:opacity-70 scale-100"
                    )}
                  >
                    {slide.type === "video" ? (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                         <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
                           <div className="border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-1" />
                         </div>
                      </div>
                    ) : (
                      <Image
                        src={slide.sourceUrl}
                        alt={`Thumb ${idx}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </button>
                ))}
                
                {/* Arrow indicator (Matches screenshot) */}
                <div className="hidden lg:flex mt-2 opacity-60 animate-bounce">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                   </svg>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FindMySizeModal 
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onSelectSize={handleSelectSize}
      />
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
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-medium uppercase tracking-wide">{title}</span>
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

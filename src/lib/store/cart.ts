
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, Product, ProductVariation } from '@/types/woocommerce';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity: number, variation?: ProductVariation) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => 
            item.product.id === product.id && 
            item.variation?.id === variation?.id
        );

        if (existingItemIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems, isOpen: true });
        } else {
          set({ 
            items: [...currentItems, { product, quantity, variation }],
            isOpen: true 
          });
        }
      },

      removeItem: (productId: string, variationId?: string) => {
        set({
          items: get().items.filter(
            (item) => 
              !(item.product.id === productId && item.variation?.id === variationId)
          ),
        });
      },

      updateQuantity: (productId: string, quantity: number, variationId?: string) => {
        if (quantity <= 0) {
           get().removeItem(productId, variationId);
           return;
        }
        set({
          items: get().items.map((item) => {
            if (item.product.id === productId && item.variation?.id === variationId) {
              return { ...item, quantity };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [], shippingFee: 0, selectedShipping: null }),
      
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const priceString = item.variation?.price || item.product.price || "0";
          const cleanPrice = priceString.replace(/[^0-9]/g, ''); 
          const price = parseFloat(cleanPrice);
          return total + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
      },

      getTotalWeight: () => {
        return get().items.reduce((total, item) => {
          const weight = item.product.weight ? Number(item.product.weight) : 0;
          return total + (weight * item.quantity);
        }, 0) || 500; // Default to 500g if no weights found
      },

      shippingFee: 0,
      setShippingFee: (fee: number) => set({ shippingFee: fee }),
      selectedShipping: null,
      setSelectedShipping: (shipping: any) => set({ selectedShipping: shipping }),
    }),
    {
      name: 'shopping-cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

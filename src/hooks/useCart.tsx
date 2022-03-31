import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = getLocalStorage()

    if (storagedCart) {
      
      return JSON.parse(storagedCart);
    }

    return [];
  });

  function getLocalStorage(){
    const localStorageKey = '@RocketShoes:cart'
    return localStorage.getItem(localStorageKey)
  }

  async function getProductStock(productId: number){
    const productStock = await api.get(`/stock/${productId}`).then(res => res.data.amount)
    return productStock
  }
  
  const addProduct = async (productId: number) => {
    try {
      const productStock = await getProductStock(productId)

      if(productStock <= 0){
        throw new Error('Quantidade solicitada fora de estoque')
      }




    } catch(err) {
      if(err instanceof Error){
        toast.error(err.message)
      }
    }
  };


  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

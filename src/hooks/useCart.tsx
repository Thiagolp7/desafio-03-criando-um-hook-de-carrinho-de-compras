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

  function setLocalStorage(newCart: Product[]){
    const localStorageKey = '@RocketShoes:cart'
    const cart = JSON.stringify(newCart)
    localStorage.setItem(localStorageKey, cart)
  }

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = JSON.parse(JSON.stringify(cart))
      const productExist = updatedCart.find((product: Product) => {
        return productId === product.id
      })

      const stockAmount = await api.get(`/stock/${productId}`)
      .then(res => res.data.amount)
      const currentAmount = productExist ? productExist.amount : 0
      const newAmount = currentAmount + 1

      if(newAmount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if(productExist){
        productExist.amount = newAmount
        setCart(updatedCart)
        setLocalStorage(updatedCart)
        return
      }

      if(!productExist){
        const product = await api.get(`/products/${productId}`)
        
        const newProduct = {...product.data, amount: 1}
        updatedCart.push(newProduct)

        setCart(updatedCart)
        setLocalStorage(updatedCart)
      }

    } catch(err){
      toast.error('Erro na adição do produto')
      if(err instanceof Error){
        console.log(err.message)
      }
      
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = JSON.parse(JSON.stringify(cart))
      
      const product = updatedCart.find((product: Product) => {
        return productId === product.id
      })

      console.log(product)

      if(!product){
        throw new Error("Erro na remoção do produto")
      }

      updatedCart.pop(product)
      setCart(updatedCart)
      setLocalStorage(updatedCart)
    } catch(err) {
      if(err instanceof Error){ 
        toast.error(err.message);
      }
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const newAmount = amount

      if(newAmount < 1){
        toast.error('Erro na alteração de quantidade do produto');
        return
      }

      const stock = await api.get(`/stock/${productId}`)
      .then(res => res.data.amount)
      
      if(newAmount > stock){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      
      const oldCart = JSON.parse(JSON.stringify(cart))
      
      const updatedCart = oldCart.map((product: Product) => {
        return (
          product.id === productId 
          ? {...product, amount: newAmount} 
          : product
        )
      })

      setCart(updatedCart)
      setLocalStorage(updatedCart)

    } catch {
      toast.error('Erro na alteração de quantidade do produto')
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

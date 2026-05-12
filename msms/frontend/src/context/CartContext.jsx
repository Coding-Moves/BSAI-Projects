// src/context/CartContext.jsx
import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(i => i.medicine_id === action.item.medicine_id);
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + 1 };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.medicine_id !== action.medicine_id) };
    case 'UPDATE_QTY': {
      const items = state.items.map(i =>
        i.medicine_id === action.medicine_id ? { ...i, quantity: Math.max(1, action.qty) } : i
      );
      return { ...state, items };
    }
    case 'SET_DISCOUNT':
      return { ...state, discount: Math.max(0, Math.min(100, action.value)) };
    case 'SET_TAX':
      return { ...state, tax: Math.max(0, action.value) };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
};

const initialState = { items: [], discount: 0, tax: 0 };

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const subtotal  = cart.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const discountAmt = (subtotal * cart.discount) / 100;
  const taxAmt      = ((subtotal - discountAmt) * cart.tax) / 100;
  const total       = subtotal - discountAmt + taxAmt;

  return (
    <CartContext.Provider value={{ cart, dispatch, subtotal, discountAmt, taxAmt, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

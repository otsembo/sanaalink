import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { users, services, crafts, bookings, orders, messages, User, Service, Craft, Booking, Order, Message } from '@/lib/data';

// Types
interface CartItem {
  craftId: string;
  quantity: number;
  price: number;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  services: Service[];
  crafts: Craft[];
  bookings: Booking[];
  orders: Order[];
  messages: Message[];
  cart: CartItem[];
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
}

type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { craftId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CREATE_BOOKING'; payload: Booking }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'MARK_MESSAGE_READ'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_LOCATION'; payload: string };

const initialState: AppState = {
  currentUser: null,
  users,
  services,
  crafts,
  bookings,
  orders,
  messages,
  cart: [],
  searchQuery: '',
  selectedCategory: '',
  selectedLocation: '',
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addToCart: (craftId: string, quantity: number) => void;
  removeFromCart: (craftId: string) => void;
  updateCartQuantity: (craftId: string, quantity: number) => void;
  clearCart: () => void;
  createBooking: (serviceId: string, date: string, time: string, notes?: string) => boolean;
  createOrder: (items: CartItem[], shippingAddress: string) => boolean;
  sendMessage: (toId: string, content: string, type?: 'text' | 'booking_request' | 'order_inquiry') => void;
  getServiceById: (id: string) => Service | undefined;
  getCraftById: (id: string) => Craft | undefined;
  getUserById: (id: string) => User | undefined;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getFilteredServices: () => Service[];
  getFilteredCrafts: () => Craft[];
  getUserMessages: (userId: string) => Message[];
}>({
  state: initialState,
  dispatch: () => {},
  login: () => false,
  logout: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartQuantity: () => {},
  clearCart: () => {},
  createBooking: () => false,
  createOrder: () => false,
  sendMessage: () => {},
  getServiceById: () => undefined,
  getCraftById: () => undefined,
  getUserById: () => undefined,
  getCartTotal: () => 0,
  getCartItemCount: () => 0,
  getFilteredServices: () => [],
  getFilteredCrafts: () => [],
  getUserMessages: () => [],
});

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    
    case 'LOGOUT':
      return { ...state, currentUser: null, cart: [] };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.craftId === action.payload.craftId);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.craftId === action.payload.craftId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.craftId !== action.payload),
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.craftId === action.payload.craftId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'CREATE_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.payload],
      };
    
    case 'CREATE_ORDER':
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };
    
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    
    case 'MARK_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload ? { ...msg, read: true } : msg
        ),
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'SET_LOCATION':
      return { ...state, selectedLocation: action.payload };
    
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ujuzi-cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      cartItems.forEach((item: CartItem) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
      });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ujuzi-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  const login = (email: string, password: string): boolean => {
    // Simple demo login - in real app would validate against backend
    const user = state.users.find(u => u.email === email);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addToCart = (craftId: string, quantity: number) => {
    const craft = state.crafts.find(c => c.id === craftId);
    if (craft) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          craftId,
          quantity,
          price: craft.priceRange.min, // Use minimum price for demo
        },
      });
    }
  };

  const removeFromCart = (craftId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: craftId });
  };

  const updateCartQuantity = (craftId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(craftId);
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { craftId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const createBooking = (serviceId: string, date: string, time: string, notes?: string): boolean => {
    if (!state.currentUser) return false;
    
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return false;

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      serviceId,
      customerId: state.currentUser.id,
      providerId: service.providerId,
      date,
      time,
      status: 'pending',
      notes,
      totalAmount: service.priceRange.min,
    };

    dispatch({ type: 'CREATE_BOOKING', payload: booking });
    return true;
  };

  const createOrder = (items: CartItem[], shippingAddress: string): boolean => {
    if (!state.currentUser) return false;

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order: Order = {
      id: `order-${Date.now()}`,
      customerId: state.currentUser.id,
      items,
      status: 'pending',
      totalAmount,
      shippingAddress,
      orderDate: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'CREATE_ORDER', payload: order });
    return true;
  };

  const sendMessage = (toId: string, content: string, type: 'text' | 'booking_request' | 'order_inquiry' = 'text') => {
    if (!state.currentUser) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      fromId: state.currentUser.id,
      toId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };

    dispatch({ type: 'SEND_MESSAGE', payload: message });
  };

  const getServiceById = (id: string) => state.services.find(s => s.id === id);
  const getCraftById = (id: string) => state.crafts.find(c => c.id === id);
  const getUserById = (id: string) => state.users.find(u => u.id === id);

  const getCartTotal = () => {
    return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFilteredServices = () => {
    let filtered = state.services;

    if (state.searchQuery) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        service.services.some(s => s.toLowerCase().includes(state.searchQuery.toLowerCase()))
      );
    }

    if (state.selectedCategory) {
      filtered = filtered.filter(service => service.category === state.selectedCategory);
    }

    if (state.selectedLocation) {
      filtered = filtered.filter(service => service.location.includes(state.selectedLocation));
    }

    return filtered;
  };

  const getFilteredCrafts = () => {
    let filtered = state.crafts;

    if (state.searchQuery) {
      filtered = filtered.filter(craft =>
        craft.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        craft.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        craft.items.some(item => item.toLowerCase().includes(state.searchQuery.toLowerCase()))
      );
    }

    if (state.selectedCategory) {
      filtered = filtered.filter(craft => craft.category === state.selectedCategory);
    }

    if (state.selectedLocation) {
      filtered = filtered.filter(craft => craft.location.includes(state.selectedLocation));
    }

    return filtered;
  };

  const getUserMessages = (userId: string) => {
    return state.messages.filter(msg => 
      msg.fromId === userId || msg.toId === userId
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createBooking,
        createOrder,
        sendMessage,
        getServiceById,
        getCraftById,
        getUserById,
        getCartTotal,
        getCartItemCount,
        getFilteredServices,
        getFilteredCrafts,
        getUserMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
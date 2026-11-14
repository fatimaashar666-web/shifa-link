"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AlertCircle, Check, Clock, Home, MapPin, Scan, ShoppingCart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface DiagnosticCatalogItem {
  id: string;
  code: string | null;
  name: string;
  category: string;
  description: string | null;
  shortDescription: string | null;
  turnaroundHours: number;
  homeCollection: boolean;
  basePrice: number | null;
  providerName: string | null;
  organizationId: string | null;
  type: "LAB" | "RADIOLOGY";
}

interface DiagnosticCartItem extends DiagnosticCatalogItem {
  quantity: number;
}

interface DiagnosticCatalogClientProps {
  items: DiagnosticCatalogItem[];
  type: "LAB" | "RADIOLOGY";
  labels: {
    addToCart: string;
    addedToCart: string;
    cart: string;
    checkout: string;
    continueShopping: string;
    priceOnRequest: string;
    provider: string;
    remove: string;
    reportWithinHours: string;
    homeCollectionAvailable: string;
    paymentNotice: string;
    cartEmpty: string;
    test: string;
    tests: string;
    subtotal: string;
    close: string;
    certifiedService: string;
  };
}

const CART_STORAGE_KEY = "shifalink-diagnostic-cart";
const CART_CHANGE_EVENT = "shifalink-diagnostic-cart-change";
const DEFAULT_CHECKOUT_URL = "https://www.jazzcash.com.pk/";
const EMPTY_CART: DiagnosticCartItem[] = [];

let cartSnapshotRaw: string | null | undefined;
let cartSnapshot: DiagnosticCartItem[] = EMPTY_CART;

function readCart(): DiagnosticCartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
  if (savedCart === cartSnapshotRaw) return cartSnapshot;

  cartSnapshotRaw = savedCart;
  try {
    cartSnapshot = savedCart ? (JSON.parse(savedCart) as DiagnosticCartItem[]) : EMPTY_CART;
    return cartSnapshot;
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    cartSnapshotRaw = null;
    cartSnapshot = EMPTY_CART;
    return cartSnapshot;
  }
}

function subscribeToCart(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CART_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_CHANGE_EVENT, callback);
  };
}

function formatPrice(price: number | null) {
  return price === null ? null : `Rs. ${price.toLocaleString()}`;
}

export function DiagnosticCatalogClient({ items, type, labels }: DiagnosticCatalogClientProps) {
  const cart = useSyncExternalStore(subscribeToCart, readCart, () => EMPTY_CART);
  const [selectedItem, setSelectedItem] = useState<DiagnosticCatalogItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const knownSubtotal = cart.reduce(
    (total, item) => total + (item.basePrice === null ? 0 : item.basePrice * item.quantity),
    0,
  );
  const hasUnpricedItem = cart.some((item) => item.basePrice === null);

  const cartIds = useMemo(() => new Set(cart.map((item) => item.id)), [cart]);

  function updateCart(updater: (currentCart: DiagnosticCartItem[]) => DiagnosticCartItem[]) {
    const nextCart = updater(readCart());
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }

  function addToCart(item: DiagnosticCatalogItem) {
    updateCart((currentCart) => {
      const existing = currentCart.find((cartItem) => cartItem.id === item.id);
      if (existing) return currentCart;
      return [...currentCart, { ...item, quantity: 1 }];
    });
    setSelectedItem(item);
  }

  function removeFromCart(itemId: string) {
    updateCart((currentCart) => currentCart.filter((item) => item.id !== itemId));
  }

  function continueToPayment() {
    const checkoutUrl = process.env.NEXT_PUBLIC_DIAGNOSTIC_CHECKOUT_URL ?? DEFAULT_CHECKOUT_URL;
    const checkoutItems = cart.map((item) => ({
      code: item.code,
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      price: item.basePrice,
      organizationId: item.organizationId,
    }));
    const separator = checkoutUrl.includes("?") ? "&" : "?";
    const url = `${checkoutUrl}${separator}${new URLSearchParams({
      source: "shifalink",
      items: JSON.stringify(checkoutItems),
      total: String(knownSubtotal),
    }).toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{labels.cart}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {cartCount === 0 ? labels.cartEmpty : `${cartCount} ${cartCount === 1 ? labels.test : labels.tests} · Rs. ${knownSubtotal.toLocaleString()}`}
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => setIsCartOpen(true)} disabled={cartCount === 0}>
          <ShoppingCart className="h-4 w-4" />
          {labels.cart} ({cartCount})
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => {
          const price = formatPrice(item.basePrice);
          const added = cartIds.has(item.id);
          return (
            <Card key={item.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${type === "LAB" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"}`}>
                    {type === "LAB" ? <Scan className="h-5 w-5" /> : <Scan className="h-5 w-5" />}
                  </div>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                </div>
                <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {item.description ?? item.shortDescription ?? labels.certifiedService}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-400">
                <div className="space-y-1.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>{labels.reportWithinHours.replace("{hours}", String(item.turnaroundHours))}</span>
                  </div>
                  {item.homeCollection && (
                    <div className="flex items-center gap-1.5 pt-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <Home className="h-3.5 w-3.5" />
                      <span>{labels.homeCollectionAvailable}</span>
                    </div>
                  )}
                  {item.providerName && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{labels.provider}: {item.providerName}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="mt-2 flex flex-col items-stretch gap-3 border-t border-slate-100 p-6 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-bold text-slate-900 dark:text-white">
                  {price ?? labels.priceOnRequest}
                </div>
                <Button type="button" size="sm" variant={added ? "secondary" : "default"} onClick={() => addToCart(item)}>
                  {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {added ? labels.addedToCart : labels.addToCart}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="diagnostic-cart-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{labels.addedToCart}</p>
                <h2 id="diagnostic-cart-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{selectedItem.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatPrice(selectedItem.basePrice) ?? labels.priceOnRequest}</p>
              </div>
              <button type="button" aria-label={labels.close} onClick={() => setSelectedItem(null)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span>{labels.cart}</span>
                <span className="font-semibold">{cartCount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                <span>{labels.subtotal}</span>
                <span className="font-semibold">Rs. {knownSubtotal.toLocaleString()}</span>
              </div>
            </div>
            {hasUnpricedItem && (
              <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{labels.paymentNotice}</span>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => { setSelectedItem(null); setIsCartOpen(true); }}>
                {labels.cart}
              </Button>
              <Button type="button" onClick={() => { setSelectedItem(null); continueToPayment(); }}>
                {labels.checkout}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="diagnostic-cart-summary-title">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 id="diagnostic-cart-summary-title" className="text-lg font-semibold text-slate-900 dark:text-white">{labels.cart}</h2>
              <button type="button" aria-label={labels.close} onClick={() => setIsCartOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatPrice(item.basePrice) ?? labels.priceOnRequest}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>{labels.remove}</Button>
                </div>
              ))}
            </div>
            {hasUnpricedItem && (
              <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">{labels.paymentNotice}</p>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">{labels.subtotal}</span>
              <span className="font-bold text-slate-900 dark:text-white">Rs. {knownSubtotal.toLocaleString()}</span>
            </div>
            <Button type="button" className="mt-4 w-full" onClick={continueToPayment} disabled={cart.length === 0}>
              {labels.checkout}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

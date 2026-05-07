"use client";
import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/contexts/auth-context";
import type { UserCollection } from "@/lib/types";

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<UserCollection[]>([]);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.collections(user.email));
      if (raw) setCollections(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user]);

  const createCollection = useCallback((name: string, description: string, isPublic: boolean = true) => {
    if (!user) return null;
    const collection: UserCollection = {
      id: crypto.randomUUID(),
      name,
      description,
      skillIds: [],
      createdAt: new Date().toISOString(),
      userId: user.email,
      isPublic,
    };
    setCollections(prev => {
      const updated = [...prev, collection];
      localStorage.setItem(STORAGE_KEYS.collections(user.email), JSON.stringify(updated));
      return updated;
    });
    return collection;
  }, [user]);

  const addToCollection = useCallback((collectionId: string, skillId: string) => {
    if (!user) return;
    setCollections(prev => {
      const updated = prev.map(c =>
        c.id === collectionId && !c.skillIds.includes(skillId)
          ? { ...c, skillIds: [...c.skillIds, skillId] }
          : c
      );
      localStorage.setItem(STORAGE_KEYS.collections(user.email), JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const removeFromCollection = useCallback((collectionId: string, skillId: string) => {
    if (!user) return;
    setCollections(prev => {
      const updated = prev.map(c =>
        c.id === collectionId
          ? { ...c, skillIds: c.skillIds.filter(id => id !== skillId) }
          : c
      );
      localStorage.setItem(STORAGE_KEYS.collections(user.email), JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const deleteCollection = useCallback((collectionId: string) => {
    if (!user) return;
    setCollections(prev => {
      const updated = prev.filter(c => c.id !== collectionId);
      localStorage.setItem(STORAGE_KEYS.collections(user.email), JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  return { collections, createCollection, addToCollection, removeFromCollection, deleteCollection };
}

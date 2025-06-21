import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdBy?: string;
  createdAt?: Date;
}

interface GlobalTemplateState {
  templates: MessageTemplate[];
  lastFetched: number;
  isLoading: boolean;
  
  setTemplates: (templates: MessageTemplate[]) => void;
  addTemplate: (template: MessageTemplate) => void;
  removeTemplate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  shouldRefresh: () => boolean;
  markFetched: () => void;
}

export const useGlobalTemplates = create<GlobalTemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      lastFetched: 0,
      isLoading: false,
      
      setTemplates: (templates) => {
        console.log('Setting templates in global store:', templates.length);
        set({ templates });
      },
      
      addTemplate: (template) => {
        console.log('Adding template to global store:', template.name);
        set((state) => ({
          templates: [...state.templates, template]
        }));
      },
      
      removeTemplate: (id) => {
        console.log('Removing template from global store:', id);
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id)
        }));
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      shouldRefresh: () => {
        const { templates } = get();
        // Only refresh if no templates exist - rely on global storage for persistence
        return templates.length === 0;
      },
      
      markFetched: () => set({ lastFetched: Date.now() })
    }),
    {
      name: 'kaiserliche-global-templates-permanent',
      storage: createJSONStorage(() => localStorage),
      // Persist templates permanently across all admin sessions, browser closure, offline periods
      partialize: (state) => ({ 
        templates: state.templates, 
        lastFetched: state.lastFetched 
      }),
      version: 2, // New version for permanent storage
      // Merge function to ensure templates persist from previous sessions
      merge: (persistedState: any, currentState: any) => ({
        ...currentState,
        templates: persistedState?.templates || currentState.templates,
        lastFetched: persistedState?.lastFetched || currentState.lastFetched
      })
    }
  )
);
import { GoogleGenAI } from "@google/genai";

class ApiKeyManager {
    private static instance: ApiKeyManager;
    private keys: string[];
    private currentIndex: number = 0;
    private exhaustedKeys: Set<number> = new Set();
    private currentAiInstance: GoogleGenAI;

    private constructor() {
        const apiKeyString = process.env.API_KEY;
        if (!apiKeyString) {
            throw new Error("API_KEY environment variable not set.");
        }
        this.keys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
        if (this.keys.length === 0) {
            throw new Error("API_KEY environment variable is empty or invalid.");
        }
        this.currentAiInstance = new GoogleGenAI({ apiKey: this.keys[this.currentIndex] });
        console.log(`ApiKeyManager initialized with ${this.keys.length} keys.`);
    }

    public static getInstance(): ApiKeyManager {
        if (!ApiKeyManager.instance) {
            ApiKeyManager.instance = new ApiKeyManager();
        }
        return ApiKeyManager.instance;
    }

    public getCurrentAiInstance(): GoogleGenAI {
        return this.currentAiInstance;
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }
    
    public rotateToNextKey(): boolean {
        this.exhaustedKeys.add(this.currentIndex);
        
        if (this.exhaustedKeys.size >= this.keys.length) {
            this.exhaustedKeys.clear(); 
            console.warn("All API keys are exhausted in this cycle. Resetting cycle and retrying from the start.");
            // Allow retry from the beginning
        }

        let nextIndex = (this.currentIndex + 1) % this.keys.length;
        
        this.currentIndex = nextIndex;
        this.currentAiInstance = new GoogleGenAI({ apiKey: this.keys[this.currentIndex] });
        console.log(`Rotated to API key index: ${this.currentIndex}`);
        return true;
    }
    
    public resetCycle() {
        this.exhaustedKeys.clear();
    }
}

export const apiKeyManager = ApiKeyManager.getInstance();

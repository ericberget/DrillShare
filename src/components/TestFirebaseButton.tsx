'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';

export function TestFirebaseButton() {
  const { user } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [checkResult, setCheckResult] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const addTestContent = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Creating test content...');
      
      // Create a test content item with a very distinctive title
      const testContent = {
        title: `DIRECT TEST ITEM - ${new Date().toLocaleTimeString()}`,
        description: 'This is a test content item created directly via Firestore with the TEST button',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'hitting',
        skillLevel: 'beginner',
        tags: ['test', 'direct-firestore', 'test-button'],
        orientation: 'horizontal',
        userId: user?.uid || 'anonymous',
        isSample: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Test content object prepared:', testContent);
      
      // Add the document to Firestore
      const docRef = await addDoc(collection(db, 'content'), testContent);
      
      console.log('SUCCESSFULLY ADDED DOCUMENT! ID:', docRef.id);
      console.log('Check Firestore for a document with title:', testContent.title);
      
      setResult({
        success: true,
        message: `Success! Document created with ID: ${docRef.id}`
      });
    } catch (error) {
      console.error('Error adding document:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkContent = async () => {
    setIsChecking(true);
    setCheckResult(null);
    
    try {
      console.log('Checking Firestore content...');
      
      // Query the content collection
      const q = query(collection(db, 'content'), where('tags', 'array-contains', 'test-button'));
      const querySnapshot = await getDocs(q);
      
      // Count documents and list their titles
      let count = 0;
      const titles: string[] = [];
      
      querySnapshot.forEach((doc) => {
        count++;
        const data = doc.data();
        titles.push(`${doc.id}: ${data.title}`);
        console.log(`Document ${doc.id}:`, data);
      });
      
      const resultMessage = `Found ${count} test documents:\n${titles.join('\n')}`;
      console.log(resultMessage);
      setCheckResult(resultMessage);
    } catch (error) {
      console.error('Error checking content:', error);
      setCheckResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-4 border-red-500 bg-yellow-100 rounded-md">
      <h2 className="text-xl font-bold text-red-600">FIRESTORE TEST CONTROLS</h2>
      <div className="flex gap-2">
        <Button 
          onClick={addTestContent} 
          disabled={isLoading}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? 'Testing...' : 'Test Firestore Direct Save'}
        </Button>
        
        <Button 
          onClick={checkContent} 
          disabled={isChecking}
          variant="outline"
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${isChecking ? 'opacity-50' : ''}`}
        >
          {isChecking ? 'Checking...' : 'Check Test Documents'}
        </Button>
      </div>
      
      {/* Fallback HTML buttons in case there's an issue with the UI components */}
      <div className="mt-4 p-2 bg-red-200 border border-red-500 rounded">
        <p className="font-bold text-red-800 mb-2">Fallback HTML Buttons:</p>
        <div className="flex gap-2">
          <button
            onClick={addTestContent}
            disabled={isLoading}
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            HTML: {isLoading ? 'Testing...' : 'Test Firestore Direct Save'}
          </button>

          <button
            onClick={checkContent}
            disabled={isChecking}
            style={{
              backgroundColor: 'green',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: isChecking ? 'not-allowed' : 'pointer',
              opacity: isChecking ? 0.5 : 1
            }}
          >
            HTML: {isChecking ? 'Checking...' : 'Check Test Documents'}
          </button>
        </div>
      </div>
      
      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
      
      {checkResult && (
        <div className="p-3 rounded-md bg-blue-100 text-blue-800 whitespace-pre-wrap">
          {checkResult}
        </div>
      )}
    </div>
  );
} 
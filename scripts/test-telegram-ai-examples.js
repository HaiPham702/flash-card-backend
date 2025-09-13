#!/usr/bin/env node

/**
 * Test script để kiểm tra tính năng tạo ví dụ AI cho Telegram flashcards
 */

require('dotenv').config();
const mongoose = require('mongoose');
const telegramService = require('../services/telegramService');

async function testAIExampleGeneration() {
    console.log('🧪 Testing AI Example Generation for Telegram Flashcards...\n');
    
    try {
        // Test data - các từ mẫu để test
        const testWords = [
            { word: 'happy', meaning: 'vui vẻ, hạnh phúc' },
            { word: 'beautiful', meaning: 'đẹp' },
            { word: 'intelligent', meaning: 'thông minh' },
            { word: 'difficult', meaning: 'khó khăn' },
            { word: 'adventure', meaning: 'cuộc phiêu lưu' }
        ];

        console.log('📝 Testing individual word examples:\n');
        
        for (const testWord of testWords) {
            console.log(`Testing: "${testWord.word}" (${testWord.meaning})`);
            
            try {
                const example = await telegramService.generateWordExample(testWord.word, testWord.meaning);
                
                if (example) {
                    console.log(`✅ Generated: ${example}\n`);
                } else {
                    console.log(`❌ No example generated\n`);
                }
            } catch (error) {
                console.log(`❌ Error: ${error.message}\n`);
            }
            
            // Delay để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('🎴 Testing full card message format:\n');
        
        // Test format card message
        const testCard = {
            front: 'beautiful',
            back: 'đẹp, xinh đẹp',
            pronunciation: 'ˈbjuːtɪfʊl'
        };

        const message = await telegramService.formatCardMessage('Test Deck', testCard);
        console.log('Full card message:');
        console.log('-------------------');
        console.log(message);
        console.log('-------------------\n');

        console.log('✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Chạy test mà không cần kết nối database
async function main() {
    console.log('🚀 Starting AI Example Generation Tests...');
    
    // Kiểm tra environment variables
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        process.exit(1);
    }
    
    await testAIExampleGeneration();
}

main().catch(console.error);

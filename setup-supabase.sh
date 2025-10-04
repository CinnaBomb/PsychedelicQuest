#!/bin/bash

# Supabase Setup Script for PsychedelicQuest

echo "🎮 PsychedelicQuest - Supabase Setup Script"
echo "==========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env and add your Supabase credentials!"
    echo ""
    echo "Follow these steps:"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Get your connection string from Project Settings > Database > Connection Pooling"
    echo "3. Update the DATABASE_URL in .env file"
    echo "4. Generate a session secret by running:"
    echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo "5. Update SESSION_SECRET in .env file"
    echo ""
    read -p "Press Enter when you've updated .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Pushing database schema to Supabase..."
npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start your game, run:"
echo "   npm run dev"
echo ""
echo "📖 For detailed instructions, see SUPABASE_SETUP.md"

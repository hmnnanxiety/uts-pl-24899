<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gear_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('code', 32)->unique();
            $table->string('name');
            $table->string('brand', 100);
            $table->string('model', 100)->nullable();

            $table->string('category', 30)->index();
            $table->string('condition', 30)->default('good');
            $table->string('status', 30)
                ->default('available')
                ->index();

            $table->string('storage_location')->nullable();
            $table->date('purchase_date')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gear_items');
    }
};
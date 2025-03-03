<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('general_insurances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id'); 
            $table->boolean("vehicle")->nullable();
            $table->boolean("fire")->nullable();
            $table->boolean("society")->nullable();
            $table->boolean("workman")->nullable();
            $table->boolean("personal_accident")->nullable();
            $table->boolean("others")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_insurances');
    }
};
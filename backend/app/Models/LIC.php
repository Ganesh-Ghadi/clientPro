<?php

namespace App\Models;

use App\Models\Client;
use Illuminate\Database\Eloquent\Model;

class LIC extends Model
{
    public function client(){
        return $this->belongsTo(Client::class, 'client_id');
    }
}
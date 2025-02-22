<?php

namespace App\Models;

use App\Models\FamilyMember;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    public function familyMembers(){
        return $this->hasMany(FamilyMember::class, 'client_id');
    }
}
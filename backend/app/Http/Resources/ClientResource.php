<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_name' => $this->client_name,
            'email' => $this->email,
            'date_of_birth' => $this->date_of_birth,
            'mobile' => $this->mobile,
            'residential_address' => $this->residential_address,
            'residential_address_pincode' => $this->residential_address_pincode,
            'office_address' => $this->office_address,
            'office_address_pincode' => $this->office_address_pincode,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'Family_members' => $this->familyMembers,
        ];
    }
}
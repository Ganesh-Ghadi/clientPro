<?php

namespace App\Http\Controllers\Api;

use App\Models\Devta;
use App\Models\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\DevtaResource;
use App\Http\Resources\ClientResource;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Controllers\Api\BaseController;

class ClientsController extends BaseController
{
    /**
     * All Devtas.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Client::query();

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('client_name', 'like', '%' . $searchTerm . '%');
            });
        }
        $clients = $query->Orderby('id', 'desc')->paginate(20);

        return $this->sendResponse(["Clients"=>ClientResource::collection($clients),
        'pagination' => [
            'current_page' => $clients->currentPage(),
            'last_page' => $clients->lastPage(),
            'per_page' => $clients->perPage(),
            'total' => $clients->total(),
        ]], "Clients retrieved successfully");
    }

    /**
     * Store Devta.
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = new Client();
        $client->client_name = $request->input("client_name");
        if(!$client->save()) {
            dd($client); exit;
        }
        return $this->sendResponse(['cClient'=> new ClientResource($client)], 'Client Created Successfully');
    }

    /**
     * Show Devta.
     */
    public function show(string $id): JsonResponse
    {
        $client = Client::find($id);

        if(!$client){
            return $this->sendError("Client not found", ['error'=>'Client not found']);
        }
        return $this->sendResponse(['Client'=> new ClientResource($client)], "Client retrieved successfully");
    }

    /**
     * Update Devta.
     */
    public function update(UpdateClientRequest $request, string $id): JsonResponse
    {
        $client = Client::find($id);
        if(!$client){
            return $this->sendError("Client not found", ['error'=>['Client not found']]);
        }
        $client->client_name = $request->input('client_name');
        $client->save();
        return $this->sendResponse(["Client"=> new ClientResource($client)], "Client Updated successfully");
    }

    /**
     * Remove Devta.
     */
    public function destroy(string $id): JsonResponse
    {
        $client = Client::find($id);
        if(!$client){
            return $this->sendError("Client not found", ['error'=>'Client not found']);
        }

        $client->delete();

        return $this->sendResponse([], "client deleted successfully");
    }

    /**
     * Fetch All Devta.
     */
    public function alldevtas(): JsonResponse
    {
        $devtas = Devta::all();

        return $this->sendResponse(["Devtas"=>DevtaResource::collection($devtas),
        ], "Devtas retrieved successfully");

    }
}

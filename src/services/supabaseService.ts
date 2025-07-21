import { supabase } from '../lib/supabaseClient';
import { Property, Tenant, Transaction } from '../types';

// Serviços para Properties
export const propertyService = {
  // Buscar todas as propriedades
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Criar nova propriedade
  async create(property: Omit<Property, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        name: property.name,
        address: property.address,
        energy_unit_name: property.energyUnitName || null,
        type: property.type,
        purchase_price: property.purchasePrice,
        rent_value: property.rentValue,
        status: property.status
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar propriedade
  async update(id: string, updates: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.address && { address: updates.address }),
        ...(updates.energyUnitName !== undefined && { energy_unit_name: updates.energyUnitName }),
        ...(updates.type && { type: updates.type }),
        ...(updates.purchasePrice !== undefined && { purchase_price: updates.purchasePrice }),
        ...(updates.rentValue !== undefined && { rent_value: updates.rentValue }),
        ...(updates.status && { status: updates.status })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar propriedade
  async delete(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Serviços para Tenants
export const tenantService = {
  // Buscar todos os inquilinos
  async getAll() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Criar novo inquilino
  async create(tenant: Omit<Tenant, 'id'>) {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        property_id: tenant.propertyId,
        name: tenant.name,
        email: tenant.email,
        cpf: tenant.cpf || null,
        phone: tenant.phone,
        start_date: tenant.startDate.toISOString(),
        agreed_payment_date: tenant.agreedPaymentDate?.toISOString() || null,
        monthly_rent: tenant.monthlyRent,
        deposit: tenant.deposit,
        payment_method: tenant.paymentMethod || null,
        installments: tenant.installments || null,
        deposit_paid_installments: tenant.depositPaidInstallments || null,
        formalized_contract: tenant.formalizedContract || null,
        status: tenant.status
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar inquilino
  async update(id: string, updates: Partial<Tenant>) {
    const updateData: any = {};
    
    if (updates.propertyId) updateData.property_id = updates.propertyId;
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.cpf !== undefined) updateData.cpf = updates.cpf;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.startDate) updateData.start_date = updates.startDate.toISOString();
    if (updates.agreedPaymentDate !== undefined) {
      updateData.agreed_payment_date = updates.agreedPaymentDate?.toISOString() || null;
    }
    if (updates.monthlyRent !== undefined) updateData.monthly_rent = updates.monthlyRent;
    if (updates.deposit !== undefined) updateData.deposit = updates.deposit;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.installments !== undefined) updateData.installments = updates.installments;
    if (updates.depositPaidInstallments !== undefined) {
      updateData.deposit_paid_installments = updates.depositPaidInstallments;
    }
    if (updates.formalizedContract !== undefined) updateData.formalized_contract = updates.formalizedContract;
    if (updates.status) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar inquilino
  async delete(id: string) {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Serviços para Transactions
export const transactionService = {
  // Buscar todas as transações
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Criar nova transação
  async create(transaction: Omit<Transaction, 'id'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        property_id: transaction.propertyId,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || null, // Allow null for description
        date: transaction.date.toISOString(),
        recurring: transaction.recurring || null,
        // created_at will be automatically set by Supabase
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar transação
  async update(id: string, updates: Partial<Transaction>) {
    const updateData: any = {};
    
    if (updates.propertyId) updateData.property_id = updates.propertyId;
    if (updates.type) updateData.type = updates.type;
    if (updates.category) updateData.category = updates.category;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description || null; // Allow null for description
    if (updates.date) updateData.date = updates.date.toISOString();
    // Ensure recurring is explicitly set to null if undefined, otherwise Supabase might not update it
    updateData.recurring = updates.recurring === undefined ? null : updates.recurring;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar transação
  async delete(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Utilitário para converter dados do Supabase para o formato da aplicação
export const mappers = {
  // Converter propriedade do Supabase para o formato da aplicação
  propertyFromSupabase(data: any): Property {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      energyUnitName: data.energy_unit_name,
      type: data.type,
      purchasePrice: data.purchase_price,
      rentValue: data.rent_value,
      status: data.status,
      createdAt: new Date(data.created_at),
      // tenant será preenchido separadamente quando necessário
    };
  },

  // Converter inquilino do Supabase para o formato da aplicação
  tenantFromSupabase(data: any): Tenant {
    return {
      id: data.id,
      propertyId: data.property_id,
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      startDate: new Date(data.start_date),
      agreedPaymentDate: data.agreed_payment_date ? new Date(data.agreed_payment_date) : undefined,
      monthlyRent: data.monthly_rent,
      deposit: data.deposit,
      paymentMethod: data.payment_method,
      installments: data.installments,
      depositPaidInstallments: data.deposit_paid_installments,
      formalizedContract: data.formalized_contract,
      status: data.status
    };
  },

  // Converter transação do Supabase para o formato da aplicação
  transactionFromSupabase(data: any): Transaction {
    return {
      id: data.id,
      propertyId: data.property_id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      recurring: data.recurring
    };
  }
};
# Supabase Quick Reference Guide

Quick reference for common database operations in your iSafe project.

---

## Client Imports

### Server-Side (API Routes, Server Components)
```typescript
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient()
```

### Client-Side (React Components)
```typescript
import { supabase } from '@/lib/supabase'
```

### Admin Operations (Service Role)
```typescript
import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient'

const supabase = getServiceRoleClient()
```

---

## Common Queries

### SELECT - Get All Records
```typescript
const { data, error } = await supabase
  .from('persons')
  .select('*')

if (error) throw error
```

### SELECT - Get One Record
```typescript
const { data, error } = await supabase
  .from('persons')
  .select('*')
  .eq('id', personId)
  .single()

if (error) throw error
```

### SELECT - With Relations
```typescript
const { data, error } = await supabase
  .from('persons')
  .select(`
    *,
    shelter:shelters(
      name,
      district,
      contact_number
    ),
    missing_report:missing_persons(*)
  `)
  .eq('id', personId)
  .single()
```

### INSERT - Create Record
```typescript
const { data, error } = await supabase
  .from('persons')
  .insert({
    full_name: 'John Doe',
    age: 30,
    gender: 'MALE',
    shelter_id: shelterId,
    health_status: 'HEALTHY'
  })
  .select()
  .single()

if (error) throw error
```

### UPDATE - Modify Record
```typescript
const { data, error } = await supabase
  .from('persons')
  .update({ age: 31 })
  .eq('id', personId)
  .select()
  .single()

if (error) throw error
```

### DELETE - Remove Record
```typescript
const { error } = await supabase
  .from('persons')
  .delete()
  .eq('id', personId)

if (error) throw error
```

---

## Filtering

### Equal
```typescript
.eq('status', 'MISSING')
```

### Not Equal
```typescript
.neq('status', 'CLOSED')
```

### Greater Than
```typescript
.gt('age', 18)
```

### Greater Than or Equal
```typescript
.gte('age', 18)
```

### Less Than
```typescript
.lt('age', 65)
```

### Less Than or Equal
```typescript
.lte('age', 65)
```

### In Array
```typescript
.in('status', ['MISSING', 'FOUND'])
```

### Like (Case Insensitive)
```typescript
.ilike('full_name', '%john%')
```

### Is Null
```typescript
.is('deleted_at', null)
```

### Is Not Null
```typescript
.not('deleted_at', 'is', null)
```

---

## Ordering & Limiting

### Order By
```typescript
.order('created_at', { ascending: false })
```

### Limit
```typescript
.limit(10)
```

### Range (Pagination)
```typescript
.range(0, 9)  // First 10 records
.range(10, 19)  // Next 10 records
```

---

## Counting

### Get Count
```typescript
const { count, error } = await supabase
  .from('persons')
  .select('*', { count: 'exact', head: true })
```

### Get Count with Filter
```typescript
const { count, error } = await supabase
  .from('missing_persons')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'MISSING')
```

---

## Table Names & Field Names

### Tables
- `persons` - People in shelters
- `missing_persons` - Missing person reports
- `shelters` - Shelter locations
- `shelter_auth` - Shelter authentication
- `matches` - Match records
- `statistics` - Cached statistics

### Common Field Names (snake_case)
- `full_name`
- `photo_url`
- `photo_public_id`
- `shelter_id`
- `health_status`
- `special_notes`
- `contact_number`
- `missing_report_id`
- `last_seen_location`
- `last_seen_district`
- `last_seen_date`
- `reporter_name`
- `reporter_phone`
- `poster_code`
- `poster_url`
- `alt_contact`
- `created_at`
- `updated_at`
- `matched_at`

---

## Error Handling

### Basic Error Handling
```typescript
const { data, error } = await supabase
  .from('persons')
  .select('*')

if (error) {
  console.error('Database error:', error)
  throw error
}
```

### Common Error Codes
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42P01` - Table does not exist
- `42703` - Column does not exist

### Error Handling Example
```typescript
const { data, error } = await supabase
  .from('persons')
  .insert({ ... })

if (error) {
  if (error.code === '23505') {
    return { error: 'Record already exists' }
  }
  if (error.code === '23503') {
    return { error: 'Related record not found' }
  }
  throw error
}
```

---

## TypeScript Types

### Import Types
```typescript
import type { Database } from '@/types/supabase'

type Person = Database['public']['Tables']['persons']['Row']
type PersonInsert = Database['public']['Tables']['persons']['Insert']
type PersonUpdate = Database['public']['Tables']['persons']['Update']
```

### Use Types
```typescript
const person: Person = {
  id: '123',
  full_name: 'John Doe',
  age: 30,
  // ... other fields
}

const newPerson: PersonInsert = {
  full_name: 'Jane Doe',
  age: 25,
  // ... required fields only
}
```

---

## Real-time Subscriptions (Optional)

### Subscribe to Changes
```typescript
const subscription = supabase
  .channel('persons-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'persons'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

---

## Authentication (If Using Supabase Auth)

### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut()
```

---

## Best Practices

1. **Always check for errors** after every query
2. **Use `.single()`** when expecting exactly one result
3. **Use service role client** only for admin operations
4. **Respect RLS policies** - use regular client for user operations
5. **Handle null values** - Supabase returns `null` when no data found
6. **Use TypeScript types** for type safety
7. **Cache service role client** (already done in the project)
8. **Use transactions via RPC** for complex multi-step operations

---

## Useful Commands

### Generate Types
```bash
npm run db:types
```

### View Supabase Dashboard
Visit: https://app.supabase.com/project/YOUR_PROJECT_ID

---

## Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgREST API Docs](https://postgrest.org/en/stable/api.html)


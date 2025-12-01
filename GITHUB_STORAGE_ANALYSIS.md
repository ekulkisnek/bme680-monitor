# GitHub Storage Capacity Analysis

## 📊 Current Setup

- **MAX_RECORDS**: 500 (keeps last 500 readings)
- **Current file size**: ~84 KB
- **Record size**: ~139 bytes per reading
- **Batching**: Commits every 100 readings or 1 hour (~24-100 commits/day)

---

## 🎯 GitHub Storage Limits

### File Limits
- **Individual file**: 100 MB maximum
- **Git LFS**: 2 GB per file (requires Git LFS setup)

### Repository Limits
- **Recommended**: <1 GB (for optimal performance)
- **Hard limit**: 5 GB (may cause performance issues)
- **Warning threshold**: GitHub may warn/restrict at 5 GB+

---

## 📈 Storage Capacity Calculations

### Current Strategy (MAX_RECORDS = 500)

**File Size:**
- Current: ~84 KB
- Maximum: ~70 KB (500 records × 139 bytes)
- **Utilization**: 0.08% of 100 MB limit ✅

**Git History Impact:**
- Commits per day: ~50 (batched)
- Data per commit: ~70 KB
- Data per day: ~3.5 MB
- Data per year: ~1.3 GB

**Time to Limits:**
- **1 GB (recommended)**: ~0.8 years (~9 months)
- **5 GB (hard limit)**: ~3.8 years

### If You Increase MAX_RECORDS

| MAX_RECORDS | File Size | File Limit | Repo Limit (1GB) | Repo Limit (5GB) |
|-------------|-----------|------------|------------------|------------------|
| **500** (current) | 70 KB | ✅ 0.07% | ~9 months | ~3.8 years |
| **1,000** | 140 KB | ✅ 0.14% | ~4.5 months | ~1.9 years |
| **5,000** | 700 KB | ✅ 0.7% | ~1.5 months | ~7 months |
| **10,000** | 1.4 MB | ✅ 1.4% | ~3 weeks | ~3.5 months |
| **50,000** | 7 MB | ✅ 7% | ~5 days | ~3 weeks |
| **100,000** | 14 MB | ✅ 14% | ~2.5 days | ~10 days |
| **500,000** | 70 MB | ✅ 70% | ~12 hours | ~2 days |
| **1,000,000** | 140 MB | ❌ **EXCEEDS 100MB** | N/A | N/A |

---

## ⚠️ Important Considerations

### 1. Git History Grows Over Time

**The Problem:**
- Each commit stores the **entire file**
- With batching (~50 commits/day), you're storing:
  - 50 copies of the file per day
  - ~1,500 copies per month
  - ~18,000 copies per year

**Example:**
- File size: 70 KB
- Commits per day: 50
- **Daily growth**: 70 KB × 50 = 3.5 MB/day
- **Monthly growth**: ~105 MB/month
- **Yearly growth**: ~1.3 GB/year

### 2. Repository Size vs File Size

**Current file**: 70 KB ✅ (well under 100 MB limit)

**But repository includes:**
- Current file: 70 KB
- Git history: All previous versions
- Other files: Code, docs, etc.

**After 1 year:**
- Current file: 70 KB
- Git history: ~1.3 GB (from commits)
- **Total repo**: ~1.3 GB+ (approaching recommended limit)

### 3. Performance Impact

GitHub recommends <1 GB for:
- ✅ Fast clones
- ✅ Quick diffs
- ✅ Efficient operations

At 5 GB+:
- ⚠️ Slower operations
- ⚠️ May hit rate limits
- ⚠️ GitHub may restrict access

---

## 💡 Recommendations

### Option 1: Keep Current Setup (Recommended for Now)

**Pros:**
- ✅ Works well for ~9 months
- ✅ Simple, no changes needed
- ✅ Well within limits

**Cons:**
- ⚠️ Will hit 1 GB limit in ~9 months
- ⚠️ Need to clean up history later

**Action:** Monitor repo size monthly, plan cleanup after 6 months

### Option 2: Increase MAX_RECORDS (If You Want More History)

**Safe increases:**
- **1,000 records**: ~140 KB file, ~4.5 months to 1 GB
- **5,000 records**: ~700 KB file, ~1.5 months to 1 GB
- **10,000 records**: ~1.4 MB file, ~3 weeks to 1 GB

**Trade-off:** More history in file, but faster repo growth

### Option 3: Reduce Commit Frequency

**Current:** ~50 commits/day (every 100 readings or 1 hour)

**Options:**
- Commit every 200 readings: ~25 commits/day → **2x longer before limits**
- Commit every 500 readings: ~10 commits/day → **5x longer before limits**
- Commit once per day: 1 commit/day → **50x longer before limits**

**Trade-off:** Less frequent backups, but much slower repo growth

### Option 4: Clean Up Git History Periodically

**Strategy:**
- Keep last 30 days of commits
- Archive older data elsewhere
- Use `git rebase` or create new branch

**When:** Every 3-6 months

**How:**
```bash
# Create archive branch
git checkout --orphan archive-$(date +%Y%m)
git add sensor-data.json
git commit -m "Archive data"
git push origin archive-$(date +%Y%m)

# Reset main branch (keeps only recent history)
git checkout main
git reset --hard HEAD~1000  # Keep last 1000 commits
git push --force origin main
```

### Option 5: Use Git LFS for Large Files

**If you need >100 MB file:**
- Enable Git LFS
- Store sensor-data.json in LFS
- 2 GB file limit (vs 100 MB)

**Setup:**
```bash
git lfs install
git lfs track "sensor-data.json"
git add .gitattributes
git commit -m "Track sensor data with LFS"
```

**Note:** Git LFS has bandwidth limits on free tier

---

## 📊 Storage Timeline (Current Setup)

### Month 1-6
- ✅ **Repo size**: <500 MB
- ✅ **Performance**: Excellent
- ✅ **No action needed**

### Month 6-9
- ⚠️ **Repo size**: 500 MB - 1 GB
- ⚠️ **Performance**: Still good
- 💡 **Action**: Plan cleanup strategy

### Month 9-12
- ⚠️ **Repo size**: 1 GB - 1.3 GB
- ⚠️ **Performance**: May slow down
- 🔧 **Action**: Clean up history or reduce commits

### Year 2+
- ❌ **Repo size**: >1.3 GB
- ❌ **Performance**: Degraded
- 🔧 **Action**: Implement cleanup or migrate storage

---

## 🎯 Practical Recommendations

### Short Term (Next 6 Months)
✅ **Keep current setup** - No changes needed
- Monitor repo size monthly
- You have plenty of headroom

### Medium Term (6-12 Months)
💡 **Consider:**
1. Reduce commit frequency (every 200-500 readings)
2. Or increase MAX_RECORDS if you want more history
3. Start planning cleanup strategy

### Long Term (12+ Months)
🔧 **Implement:**
1. Periodic Git history cleanup
2. Or migrate to local storage + GitHub backup
3. Or use Git LFS if you need larger files

---

## 📈 Quick Reference

**Current capacity:**
- ✅ File: 0.07% of 100 MB limit
- ✅ Repo: ~9 months to 1 GB (recommended)
- ✅ Repo: ~3.8 years to 5 GB (hard limit)

**If you want more:**
- Increase MAX_RECORDS to 1,000-10,000 (still safe)
- Or reduce commit frequency
- Or use Git LFS for >100 MB files

**Bottom line:** Your current setup is **well within limits** and will work fine for **at least 6-9 months** without any changes! 🎉

---

## 🔍 Monitoring Commands

**Check repo size:**
```bash
git count-objects -vH
```

**Check file size:**
```bash
du -h sensor-data.json
```

**Check commit history:**
```bash
git log --oneline | wc -l
```

**Check GitHub repo size:**
- Go to: https://github.com/ekulkisnek/bme680-monitor/settings
- Look for repository size (if shown)

---

## 💾 Alternative: Hybrid Approach

**Best of both worlds:**
1. **Local storage** (Pi): Keep all data locally (unlimited)
2. **GitHub backup**: Only backup daily/weekly (much slower growth)
3. **Real-time access**: Read from local storage

**Result:**
- ✅ Unlimited local storage
- ✅ GitHub backup (much slower growth)
- ✅ Real-time access
- ✅ Best of both worlds

This is what the self-hosted solution provides! 🚀






